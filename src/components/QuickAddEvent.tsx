import React, { useState, useEffect } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const TOAST_MS = 6000;

const QuickAddEvent: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async () => {
    if (!title.trim() || !date) return alert('Please add a title and date');
    setLoading(true);

    const tempId = 'temp-' + Date.now();
    setOpen(false);
    setTitle('');

    if (!user) {
      setToast({ id: tempId, title });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({ user_id: user.id, title: title.trim(), date: new Date(date).toISOString() })
        .select()
        .single();

      if (error) throw error;
      setToast({ id: data.id, title: data.title });
    } catch (err) {
      console.error('Failed to create event', err);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const undo = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await supabase.from('events').delete().eq('id', id);
      }
    } catch (err) {
      console.warn('Failed to undo event', err);
    } finally {
      setToast(null);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="btn btn-secondary px-3 py-1.5 text-sm flex items-center space-x-2">
        <CalendarPlus className="w-4 h-4" />
        <span>Quick Event</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue rounded-full">
                  <CalendarPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue">Quick Add Event</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-blue" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-red">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Coffee with Alex" />
              <label className="block text-sm font-medium text-red">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />

              <div className="flex justify-end space-x-2">
                <button onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={submit} disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className="bg-white border rounded-lg shadow p-3 flex items-center gap-3">
            <div>
              <div className="text-sm font-semibold">Event: {toast.title}</div>
              <div className="text-xs text-gray-500">You can undo this action</div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button onClick={() => undo(toast.id)} className="px-3 py-1 bg-gray-100 rounded text-sm">Undo</button>
              <button onClick={() => setToast(null)} className="px-3 py-1 bg-white border rounded text-sm">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddEvent;
