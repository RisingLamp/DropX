import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Shield,
  Zap,
  Share2,
  FileUp,
  Wifi,
  Send,
  DivideSquare as ReceiveSquare,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Peer from 'peerjs';

interface PeerDevice {
  id: string;
  connection?: any;
  lastSeen?: number;
}

function generateShortId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [myPeerId, setMyPeerId] = useState<string>('');
  const [peers, setPeers] = useState<PeerDevice[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [transferProgress, setTransferProgress] = useState<number>(0);
  const [isReceiving, setIsReceiving] = useState(false);
  const [receivingFileName, setReceivingFileName] = useState('');
  const [scanning, setScanning] = useState(true);
  const [manualPeerId, setManualPeerId] = useState('');
  const [connectError, setConnectError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const peerRef = useRef<Peer>();
  const chunksRef = useRef<any[]>([]);

  useEffect(() => {
    const shortId = generateShortId();
    const peer = new Peer(shortId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
    });
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My peer ID is:', id);
      setMyPeerId(id);
      startScanning();
    });

    peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);

      conn.on('data', handleIncomingData);

      setPeers((prev) => {
        if (!prev.find((p) => p.id === conn.peer)) {
          return [
            ...prev,
            { id: conn.peer, connection: conn, lastSeen: Date.now() },
          ];
        }
        return prev;
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const connectToPeer = () => {
    if (!manualPeerId || manualPeerId.length !== 4) {
      setConnectError('Please enter a valid 4-character Peer ID');
      return;
    }

    try {
      const conn = peerRef.current?.connect(manualPeerId);
      if (conn) {
        conn.on('open', () => {
          console.log('Connected to:', manualPeerId);
          conn.on('data', handleIncomingData);
          setPeers((prev) => {
            if (!prev.find((p) => p.id === manualPeerId)) {
              return [
                ...prev,
                { id: manualPeerId, connection: conn, lastSeen: Date.now() },
              ];
            }
            return prev;
          });
          setManualPeerId('');
          setConnectError('');
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
          setConnectError(
            'Failed to connect. Please check the Peer ID and try again.'
          );
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectError(
        'Failed to connect. Please check the Peer ID and try again.'
      );
    }
  };

  const startScanning = () => {
    const scanNetwork = async () => {
      if (!scanning) return;

      const possibleIds = Array.from({ length: 10 }, () => generateShortId());

      for (const id of possibleIds) {
        if (id !== myPeerId && !peers.find((p) => p.id === id)) {
          try {
            const conn = peerRef.current?.connect(id);
            if (conn) {
              conn.on('open', () => {
                console.log('Connected to:', id);
                conn.on('data', handleIncomingData);
                setPeers((prev) => {
                  if (!prev.find((p) => p.id === id)) {
                    return [
                      ...prev,
                      { id, connection: conn, lastSeen: Date.now() },
                    ];
                  }
                  return prev;
                });
              });
            }
          } catch (error) {
            console.log('Failed to connect to:', id);
          }
        }
      }

      setPeers((prev) =>
        prev.filter((peer) => Date.now() - (peer.lastSeen || 0) < 30000)
      );
      setTimeout(scanNetwork, 5000);
    };

    scanNetwork();
  };

  const handleIncomingData = (data: any) => {
    if (data.type === 'file-start') {
      setIsReceiving(true);
      setReceivingFileName(data.fileName);
      chunksRef.current = [];
    } else if (data.type === 'file-chunk') {
      chunksRef.current.push(data.chunk);
      setTransferProgress(
        Math.min((chunksRef.current.length / data.totalChunks) * 100, 100)
      );
    } else if (data.type === 'file-end') {
      const blob = new Blob(chunksRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setIsReceiving(false);
      setTransferProgress(0);
      chunksRef.current = [];
    }
  };

  const sendFile = async (file: File, peerId: string) => {
    const peer = peers.find((p) => p.id === peerId);
    if (!peer?.connection) return;

    const chunkSize = 64000;
    const totalChunks = Math.ceil(file.size / chunkSize);

    peer.connection.send({
      type: 'file-start',
      fileName: file.name,
      totalChunks,
    });

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = await file.slice(start, end).arrayBuffer();

      peer.connection.send({
        type: 'file-chunk',
        chunk,
        totalChunks,
      });

      setTransferProgress(((i + 1) / totalChunks) * 100);
    }

    peer.connection.send({
      type: 'file-end',
      fileName: file.name,
    });

    setTransferProgress(0);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-6 w-6 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">DropX</span>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full">
              <Wifi
                className={`h-5 w-5 ${
                  scanning ? 'text-green-500' : 'text-gray-400'
                }`}
              />
              <span className="text-lg font-semibold text-indigo-600">
                Your ID: {myPeerId}
              </span>
            </div>
          </div>
        </div>
      </header>
      {/* Manual Connect Section */}
      <div className="max-w-2xl mx-auto mt-12 mb-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <LinkIcon className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Connect to Peer</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={manualPeerId}
              onChange={(e) => {
                setManualPeerId(e.target.value.toUpperCase());
                setConnectError('');
              }}
              placeholder="Enter 4-character Peer ID"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {connectError && (
              <p className="mt-2 text-sm text-red-600">{connectError}</p>
            )}
          </div>
          <button
            onClick={connectToPeer}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Connect</span>
          </button>
        </div>
      </div>

      {/* Connected Peers */}
      {peers.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Available Devices</h2>
            <span className="text-sm text-gray-500">
              {peers.length} device(s) found
            </span>
          </div>
          <div className="space-y-4">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700 mb-2 md:mb-0">
                  {peer.id}
                </span>
                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    onClick={() =>
                      selectedFiles.forEach((file) => sendFile(file, peer.id))
                    }
                    disabled={selectedFiles.length === 0}
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`max-w-2xl mx-auto mb-8 ${
          dragActive
            ? 'bg-indigo-50 border-indigo-400'
            : 'bg-white border-gray-200'
        } border-2 border-dashed rounded-lg p-8 transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleChange}
        />
        <div className="text-center">
          <FileUp className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-xl font-medium text-gray-900 mb-2">
            Drag and Drop your files here
          </p>
          <p className="text-gray-500 mb-4">or</p>
          <button
            onClick={onButtonClick}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Selected Files</h2>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-700 truncate flex-1 mr-4">
                  {file.name}
                </span>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Progress */}
      {(transferProgress > 0 || isReceiving) && (
        <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isReceiving ? 'Receiving File...' : 'Sending File...'}
          </h2>
          <div className="space-y-2">
            {isReceiving && (
              <p className="text-sm text-gray-600 mb-2 truncate">
                Receiving: {receivingFileName}
              </p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${transferProgress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-600">
              {Math.round(transferProgress)}%
            </p>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        {/* How to Use Section */}
        <div className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">How to Use DropX</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <p className="text-gray-600">
                Your unique ID is displayed at the top. Share this ID with
                others to connect.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <p className="text-gray-600">
                DropX automatically scans for nearby devices. Available devices
                will appear below.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <p className="text-gray-600">
                Drag and drop files or click "Browse Files" to select files for
                sharing.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-indigo-100 rounded-full p-2">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <p className="text-gray-600">
                Click the "Send" button next to any available device to transfer
                your files.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Login Required</h3>
              <p className="text-gray-600">
                Start sharing instantly without any registration
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Upload className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Large File Support</h3>
              <p className="text-gray-600">
                Share files larger than 5GB+ with no restrictions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                End-to-End Encryption
              </h3>
              <p className="text-gray-600">
                Your files are encrypted and secure during transfer
              </p>
            </div>
          </div>
        </section>
      </main>
      {/* Team Section */}
      <section id="team" className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <img
              src="https://images.unsplash.com/photo-1738369350430-87d667611998?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDIwfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D"
              alt="Patil Uday ( Rising )"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">Patil Uday</h3>
            <p className="text-gray-600"></p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
              alt="Tribhuvan Om"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">Tribhuvan Om</h3>
            <p className="text-gray-600"></p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <img
              src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
              alt="Yadav Dron"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-semibold mb-1">Yadav Dron</h3>
            <p className="text-gray-600"></p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Share2 className="h-6 w-6" />
            <span className="text-xl font-bold">DropX</span>
          </div>
          
          <p className="text-gray-400">© 2025 DropX. All rights reserved.</p>

        </div>
      </footer>
    </div>
  );
}

export default App;
