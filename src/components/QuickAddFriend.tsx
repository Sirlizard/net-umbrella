import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';

// Simple toast UI duration
const TOAST_MS = 6000;

const QuickAddFriend: React.FC = () => {
  const { addFriend, deleteFriend } = useFriends();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = async () => {
    if (!name.trim()) return alert('Please enter a name');
    setLoading(true);
    const res = await addFriend({ name: name.trim(), contact_frequency: 5 });
    setLoading(false);
    if (!res.error && res.data) {
      setName('');
      setOpen(false);
      // show undo toast when we have an id
      if (res.data.id) setToast({ id: res.data.id, name: res.data.name || name.trim() });
    } else {
      alert('Failed to add friend: ' + res.error);
    }
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} className="btn btn-primary px-3 py-1.5 text-sm flex items-center space-x-2">
        <User className="w-4 h-4" />
        <span>Quick Add</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue">Quick Add Connection</h3>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-blue" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-red">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Alex" />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
                <button onClick={submit} disabled={loading} className="btn btn-primary">
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className="bg-white border rounded-lg shadow p-3 flex items-center gap-3">
            <div>
              <div className="text-sm font-semibold">Added: {toast.name}</div>
              <div className="text-xs text-gray-500">You can undo this action</div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <button onClick={async () => {
                // attempt undo
                await deleteFriend(toast.id);
                setToast(null);
              }} className="px-3 py-1 bg-gray-100 rounded text-sm">Undo</button>
              <button onClick={() => setToast(null)} className="px-3 py-1 bg-white border rounded text-sm">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAddFriend;
