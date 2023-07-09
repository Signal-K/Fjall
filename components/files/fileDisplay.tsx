import React, { useState, useEffect } from 'react';
import { FiFile, FiFolder } from 'react-icons/fi';
import { NextPage } from 'next';
import path from 'path';
import fs from 'fs';
import Image from 'next/image';
import { Document, Page } from 'react-pdf';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ChatBox from '../chat/ChatBox';
// import { ChatInput } from '@/components/Chat/ChatInput';
// import QuestionInput from '@/components/Chat/Tests/FlaskInput';

interface Item {
  name: string;
  isFolder: boolean;
}

interface Folder extends Item {
  items: Item[];
}

interface Metadata {
  extension: string;
  fileName: string;
  author: string[];
}

const FileList: NextPage<{ folders: Folder[] }> = ({ folders }) => {
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<Metadata | null>(null);
  const [fileContents, setFileContents] = useState<any>(null);

  const handleItemClick = (item: Item) => {
    if (item.isFolder) {
      const folder = folders.find((folder) => folder.name === item.name);
      if (folder) {
        setCurrentFolder(folder);
        setSelectedFile(null); // Reset selected file when entering a folder
      }
    } else {
      setSelectedFile(item.name);
      setFileMetadata(null); // Reset file metadata when selecting a new file
    }
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
    setSelectedFile(null); // Reset selected file when going back
    setFileMetadata(null); // Reset file metadata when going back
  };

  const renderIcon = (item: Item) => {
    if (item.isFolder) {
      return <FiFolder className="w-6 h-6 text-gray-500" />;
    } else {
      return <FiFile className="w-6 h-6 text-gray-500" />;
    }
  };

  const renderFiles = (folder: Folder | null) => {
    if (folder) {
      return (
        <>
          <li className="px-6 py-4 hover:bg-gray-100 cursor-pointer" onClick={handleBackClick}>
            <div className="flex items-center">
              <div className="flex-shrink-0">{renderIcon(folder)}</div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Back</p>
              </div>
            </div>
          </li>
          {folder.items.map((item, index) => (
            <li key={index} className="px-6 py-4 hover:bg-gray-100 cursor-pointer" onClick={() => handleItemClick(item)}>
              <div className="flex items-center">
                <div className="flex-shrink-0">{renderIcon(item)}</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                </div>
              </div>
            </li>
          ))}
        </>
      );
    } else {
      const sortedFolders = folders.filter((item) => item.isFolder).concat(folders.filter((item) => !item.isFolder));
      return sortedFolders.map((folder, index) => (
        <li key={index} className="px-6 py-4 hover:bg-gray-100 cursor-pointer" onClick={() => handleItemClick(folder)}>
          <div className="flex items-center">
            <div className="flex-shrink-0">{renderIcon(folder)}</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{folder.name}</p>
            </div>
          </div>
        </li>
      ));
    }
  };

  useEffect(() => {
    const fetchFileContents = async () => {
      try {
        const response = await fetch(`/api/nodes/content?fileName=${selectedFile}`);
        if (response.ok) {
          const data = await response.json();
          setFileContents(data);
        } else {
          console.error('Failed to fetch file contents:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch file contents:', error);
      }
    };

    if (selectedFile && fileMetadata?.extension === 'json') {
      fetchFileContents();
    }
  }, [selectedFile]);

  const renderFileContent = () => {
    if (selectedFile && fileMetadata) {
      const { extension } = fileMetadata;

      if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'svg') {
        return (
          <div className="my-4">
            <Image src={`/${selectedFile}`} alt={selectedFile} width={300} height={200} />
          </div>
        );
      } else if (extension === 'pdf') {
        return (
          <div className="my-4">
            <iframe src={`/${selectedFile}`} width='100%' height='1000px' />
            <Document file={`/${selectedFile}`}>
              <Page pageNumber={1} width={300} />
            </Document>
          </div>
        );
      } else if (extension === 'json') {
        if (fileContents) {
          return (
            <div className="bg-gray-100 p-4">
              <h3 className="text-lg font-medium mb-2">File Contents</h3>
              <pre>{JSON.stringify(fileContents, null, 2)}</pre>
            </div>
          );
        } else {
          return (
            <div className="bg-red-100 p-4">
              <p className="text-lg text-red-700">Failed to fetch file contents.</p>
            </div>
          );
        }
      } else if (extension === 'ipynb') {
        return (
          <iframe src={`/${selectedFile}`} frameBorder="0" width="100%" height="600px" />
        );
      } else if (['js', 'ts', 'java', 'py', 'rb', 'go', 'cpp', 'c', 'cs'].includes(extension)) {
        const fileContents = '// File content goes here';
        return (
          <div className="bg-gray-100 p-4">
            <h3 className="text-lg font-medium mb-2">File Contents</h3>
            <pre>{fileContents}</pre>
          </div>
        );
      } else {
        return (
          <div className="bg-red-100 p-4">
            <p className="text-lg text-red-700">Unsupported File Type</p>
          </div>
        );
      }
    }
    return null;
  };

  const renderFileMetadata = () => {
    if (selectedFile && fileMetadata) {
      return (
        <div className="bg-gray-100 p-4">
          <h3 className="text-lg font-medium mb-2">File Metadata</h3>
          <pre>{JSON.stringify(fileMetadata, null, 2)}</pre>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchFileMetadata = async () => {
      try {
        const response = await fetch('/api/nodes/metadata', {
          method: 'POST',
          body: JSON.stringify({ fileName: selectedFile }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const fileMetadata = await response.json();
          setFileMetadata(fileMetadata);
        } else {
          console.error('Failed to fetch file metadata:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch file metadata:', error);
      }
    };

    if (selectedFile) {
      fetchFileMetadata();
    }
  }, [selectedFile]);

  return (
    <div className="flex">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={10}>
          <div className="pr-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">{renderFiles(currentFolder)}</ul>
            </div>
          </div><br /><br /><br />
          <ChatBox />
          {/* <Chatting /> */}
          {/* <QuestionInput /> */}
        </Panel>
        <PanelResizeHandle
          className="w-10 h-10 bg-gray-600 hover:bg-gray-700"
          onDragging={(isDragging) => setIsResizing(isDragging)}
        />
        <Panel defaultSize={50} minSize={10}>
          <div className="pl-4">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              {renderFileContent()}
              {renderFileMetadata()}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );  
};

export const getServerSideProps = async () => {
  const publicDir = path.join(process.cwd(), 'public');
  const items: fs.Dirent[] = await new Promise((resolve, reject) => {
    fs.readdir(publicDir, { withFileTypes: true }, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });

  const folders: Folder[] = [];

  for (const item of items) {
    const itemName = item.name;
    const isFolder = item.isDirectory();

    if (isFolder) {
      const folderPath = path.join(publicDir, itemName);
      const folderItems: fs.Dirent[] = await new Promise((resolve, reject) => {
        fs.readdir(folderPath, { withFileTypes: true }, (error, files) => {
          if (error) {
            reject(error);
          } else {
            resolve(files);
          }
        });
      });

      const folder: Folder = {
        name: itemName,
        isFolder: true,
        items: [],
      };

      for (const folderItem of folderItems) {
        const folderItemName = folderItem.name;
        const isItemFolder = folderItem.isDirectory();

        folder.items.push({
          name: folderItemName,
          isFolder: isItemFolder,
        });
      }

      folders.push(folder);
    } else {
      folders.push({
        name: itemName,
        isFolder: false,
        items: [],
      });
    }
  }

  return {
    props: {
      folders,
    },
  };
};

export default FileList;