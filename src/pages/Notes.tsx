import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { Note } from '../types';
import toast from 'react-hot-toast';

const Notes: React.FC = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotes();
    }
  }, [currentUser]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', currentUser?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedNotes: Note[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
      });
      
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.title.trim() || !newNote.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    
    try {
      const noteData = {
        title: newNote.title.trim(),
        description: newNote.description.trim(),
        createdAt: new Date().toISOString(),
        userId: currentUser?.uid
      };
      
      await addDoc(collection(db, 'notes'), noteData);
      setNewNote({ title: '', description: '' });
      setShowNewNoteForm(false);
      toast.success('Note added');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditNoteId(note.id);
    setEditForm({
      title: note.title,
      description: note.description
    });
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.title.trim() || !editForm.description.trim() || !editNoteId) {
      toast.error('Title and description are required');
      return;
    }
    
    try {
      const noteRef = doc(db, 'notes', editNoteId);
      await updateDoc(noteRef, {
        title: editForm.title.trim(),
        description: editForm.description.trim()
      });
      
      setNotes(notes.map(note => 
        note.id === editNoteId 
          ? { ...note, title: editForm.title, description: editForm.description } 
          : note
      ));
      
      setEditNoteId(null);
      toast.success('Note updated');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const cancelEdit = () => {
    setEditNoteId(null);
  };

  const renderNoteGrid = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <StickyNote className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">No notes yet. Create your first note!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div 
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-md-soft overflow-hidden"
            >
              {editNoteId === note.id ? (
                <form onSubmit={handleUpdateNote} className="p-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Note title"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full mb-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[100px]"
                    placeholder="Note content"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                    <button
                      type="submit"
                      className="p-2 text-primary-500 hover:text-primary-600"
                    >
                      <Save size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{note.title}</h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-gray-400 hover:text-gray-500 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{note.description}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header title="My Notes" />
      
      <div className="container mx-auto px-4 py-6">
        {showNewNoteForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-md-soft p-4 mb-6"
          >
            <form onSubmit={handleCreateNote}>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title"
                className="w-full mb-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <textarea
                value={newNote.description}
                onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                placeholder="Note content"
                className="w-full mb-3 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[150px]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-md hover:opacity-90"
                >
                  Add Note
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setShowNewNoteForm(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center w-full py-3 mb-6 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Plus size={20} className="mr-2 text-primary-500" />
            <span>Add New Note</span>
          </motion.button>
        )}
        
        {renderNoteGrid()}
      </div>
      
      <Navbar />
    </div>
  );
};

export default Notes;