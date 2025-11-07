import React, { useEffect, useMemo, useState } from 'react';
import { getEventOfTheDay } from '../data/eventsOfDay';
import { useFriends } from '../hooks/useFriends';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ConnectionGraph from './ConnectionGraph';

type EventRecord = {
  id: string;
  title: string;
  date: string; // ISO
  notes?: string;
  taggedFriendIds: string[];
  createdAt: string;
};

const STORAGE_KEY = 'net-umbrella:events:v1';

export const EventsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { friends, loading: friendsLoading } = useFriends();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterFriend, setFilterFriend] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [graphFromFiltered, setGraphFromFiltered] = useState(true);
  const [hoverTooltip, setHoverTooltip] = useState<{ id: string; name: string; x: number; y: number } | null>(null);
  const [lastCreated, setLastCreated] = useState<{
    id: string;
    title: string;
    taggedFriendIds: string[];
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [edgeDetails, setEdgeDetails] = useState<{ a: string; b: string; events: EventRecord[] } | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLocal = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setEvents(JSON.parse(raw));
      } catch {
        setEvents([]);
      }
    };

    const loadRemote = async () => {
      if (!user) return loadLocal();
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, date, notes, created_at, event_tags(friend_id)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!mounted) return;
        const mapped: EventRecord[] = (data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          date: d.date,
          notes: d.notes || undefined,
          taggedFriendIds: (d.event_tags || []).map((t: any) => t.friend_id),
          createdAt: d.created_at,
        }));
        setEvents(mapped);
      } catch (err) {
        console.error('Failed to load events from Supabase', err);
        loadLocal();
      }
    };

    loadRemote();

    let subscription: any;
    if (user) {
      subscription = supabase
        .channel('realtime_events')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
          loadRemote();
        })
        .subscribe();
    }

    return () => {
      mounted = false;
      try {
        subscription?.unsubscribe();
      } catch {}
    };
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {}
  }, [events]);

  const addEvent = async () => {
    if (!title.trim() || !date) return;
    const tagged = Object.keys(selectedIds).filter((k) => selectedIds[k]);

    const temp: EventRecord = {
      id: 'temp-' + String(Date.now()),
      title: title.trim(),
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
      taggedFriendIds: tagged,
      createdAt: new Date().toISOString(),
    };
    setEvents((s) => [temp, ...s]);
    setLastCreated({ id: temp.id, title: temp.title, taggedFriendIds: temp.taggedFriendIds });

    setTitle('');
    setDate('');
    setNotes('');
    setSelectedIds({});
    setShowForm(false);

    if (!user) return;

    try {
      const { data: inserted, error } = await supabase
        .from('events')
        .insert({ user_id: user.id, title: temp.title, date: temp.date, notes: temp.notes })
        .select()
        .single();
      if (error) throw error;

      if (tagged.length > 0) {
        const rows = tagged.map((fid) => ({ event_id: inserted.id, friend_id: fid }));
        const { error: tagError } = await supabase.from('event_tags').insert(rows);
        if (tagError) throw tagError;
      }

      setLastCreated({ id: inserted.id, title: inserted.title, taggedFriendIds: tagged });

      const reload = await supabase
        .from('events')
        .select('id, title, date, notes, created_at, event_tags(friend_id)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (reload.error) throw reload.error;
      const mapped: EventRecord[] = (reload.data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        notes: d.notes || undefined,
        taggedFriendIds: (d.event_tags || []).map((t: any) => t.friend_id),
        createdAt: d.created_at,
      }));
      setEvents(mapped);
    } catch (err) {
      console.error('Error saving event to Supabase', err);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents((s) => s.filter((e) => e.id !== id));
    if (!id.startsWith('temp-') && user) {
      supabase.from('events').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Failed to delete event', error);
      });
    }
  };

  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSelectedIds, setEditSelectedIds] = useState<Record<string, boolean>>({});

  const openEditEvent = (ev: EventRecord) => {
    setEditingEvent(ev);
    setEditTitle(ev.title);
    try {
      setEditDate(ev.date ? new Date(ev.date).toISOString().substring(0, 10) : '');
    } catch {
      setEditDate('');
    }
    setEditNotes(ev.notes || '');
    const sel: Record<string, boolean> = {};
    for (const id of ev.taggedFriendIds || []) sel[id] = true;
    setEditSelectedIds(sel);
  };

  const saveEditEvent = async (updated: EventRecord) => {
    setEvents((s) => s.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEvent(null);

    if (!user || updated.id.startsWith('temp-')) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ title: updated.title, date: updated.date, notes: updated.notes })
        .eq('id', updated.id);
      if (error) throw error;

      await supabase.from('event_tags').delete().eq('event_id', updated.id);
      if (updated.taggedFriendIds && updated.taggedFriendIds.length) {
        const rows = updated.taggedFriendIds.map((fid) => ({ event_id: updated.id, friend_id: fid }));
        await supabase.from('event_tags').insert(rows);
      }
    } catch (err) {
      console.error('Failed to save event edit to Supabase', err);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (search && !ev.title.toLowerCase().includes(search.toLowerCase()) && !(ev.notes || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterFriend && !ev.taggedFriendIds.includes(filterFriend)) return false;
      if (dateFrom && new Date(ev.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(ev.date) > new Date(dateTo)) return false;
      return true;
    });
  }, [events, search, filterFriend, dateFrom, dateTo]);

  const graph = useMemo(() => {
    const nodes: Record<string, { id: string; name: string; count: number }> = {};
    const edges: Record<string, number> = {};

    for (const f of friends || []) {
      nodes[f.id] = { id: f.id, name: f.name, count: 0 };
    }

    const sourceEvents = graphFromFiltered ? filteredEvents : events;

    for (const ev of sourceEvents) {
      const ids = ev.taggedFriendIds.filter((id) => !!nodes[id]);
      for (const id of ids) {
        nodes[id].count = (nodes[id].count || 0) + 1;
      }
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = ids[i] < ids[j] ? ids[i] : ids[j];
          const b = ids[i] < ids[j] ? ids[j] : ids[i];
          const key = `${a}|${b}`;
          edges[key] = (edges[key] || 0) + 1;
        }
      }
    }

    return { nodes: Object.values(nodes), edges };
  }, [events, friends, filteredEvents, graphFromFiltered]);

  const eventOfTheDay = useMemo(() => {
    try {
      return getEventOfTheDay(new Date());
    } catch {
      return 'Plan something fun today!';
    }
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue">Events & Plans</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm((s) => !s)} className="px-3 py-2 text-sm bg-gray-100 text-blue rounded-lg hover:bg-gray-200 transition-colors duration-200">
            {showForm ? 'Close' : 'New Event'}
          </button>
          <button onClick={onBack} className="px-3 py-2 text-sm bg-gray-50 text-blue rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Back
          </button>
        </div>
      </div>

      {lastCreated && (
        <div className="mb-4 p-3 rounded-lg border bg-green-50 border-green-200 flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-green-800">Event created: {lastCreated.title}</div>
            <div className="text-xs text-gray-700">Tagged: {lastCreated.taggedFriendIds.map((id) => friends.find((f) => f.id === id)?.name || 'Unknown').join(', ')}</div>
            <div className="text-xs text-gray-600 mt-1">Connections created: {Math.max(0, (lastCreated.taggedFriendIds.length * (lastCreated.taggedFriendIds.length - 1)) / 2)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setGraphFromFiltered(true); setFilterFriend(null); }} className="px-2 py-1 bg-white border rounded text-sm">View on graph</button>
            <button onClick={() => setLastCreated(null)} className="px-2 py-1 bg-white border rounded text-sm">Dismiss</button>
          </div>
        </div>
      )}

      <div className="mb-4 p-4 rounded-lg border border-pink/30 bg-[#fff8fb]">
        <p className="text-sm text-red font-semibold mb-1">Suggested event of the day</p>
        <p className="text-blue">{eventOfTheDay}</p>
        <p className="mt-1 text-xs text-gray-600">Create an event, tag connections, and watch your connection map grow.</p>
      </div>

      {showForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="px-3 py-2 border rounded" />
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="px-3 py-2 border rounded" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="px-3 py-2 border rounded" rows={3} />
            <div>
              <div className="text-sm font-medium mb-2">Tag connections</div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                {friendsLoading ? (
                  <div className="text-sm text-gray-500">Loading connections...</div>
                ) : friends.length === 0 ? (
                  <div className="text-sm text-gray-500">No connections yet</div>
                ) : (
                  friends.map((f) => (
                    <label key={f.id} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!selectedIds[f.id]} onChange={(e) => setSelectedIds((s) => ({ ...s, [f.id]: e.target.checked }))} />
                      <span>{f.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={addEvent} className="px-3 py-2 bg-blue text-white rounded">Create</button>
              <button onClick={() => setShowForm(false)} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-3 p-3 border border-gray-100 rounded bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events or notes" className="px-2 py-1 border rounded w-full text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <select value={filterFriend || ''} onChange={(e) => setFilterFriend(e.target.value || null)} className="px-2 py-1 border rounded text-sm">
                <option value="">All friends</option>
                {friends.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-1 border rounded text-sm" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-1 border rounded text-sm" />
              <label className="text-sm inline-flex items-center gap-2">
                <input type="checkbox" checked={graphFromFiltered} onChange={(e) => setGraphFromFiltered(e.target.checked)} />
                Graph from filtered
              </label>
              <div className="ml-auto" />
            </div>
          </div>
          <h3 className="text-sm font-semibold mb-2">Past Events</h3>
          {events.length === 0 ? (
            <div className="p-4 border border-gray-200 rounded text-sm text-gray-500">No events yet — create one to start tracking plans and connections.</div>
          ) : (
            <ul className="space-y-2">
              {events.map((ev) => (
                <li key={ev.id} className="p-3 border border-gray-100 rounded bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue">{ev.title}</div>
                      <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                      {ev.notes && <div className="text-xs text-gray-600 mt-1">{ev.notes}</div>}
                      {ev.taggedFriendIds.length > 0 && (
                        <div className="mt-2 text-xs text-gray-700">Tagged: {ev.taggedFriendIds.map((id) => friends.find((f) => f.id === id)?.name || 'Unknown').join(', ')}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-400">{new Date(ev.createdAt).toLocaleString()}</div>
                      <div className="flex flex-col items-end gap-1">
                        <button onClick={() => openEditEvent(ev)} className="text-xs text-blue hover:underline">Edit</button>
                        <button onClick={() => deleteEvent(ev.id)} className="text-xs text-red hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Connection Map</h3>
          <div className="p-3 border border-gray-100 rounded bg-white">
            <div style={{ position: 'relative' }}>
              <ConnectionGraph
                nodes={graph.nodes}
                edges={graph.edges}
                width={520}
                height={360}
                onNodeClick={(id) => {
                  setFilterFriend(id);
                }}
                onNodeHover={(id, coords) => {
                  if (!id) return setHoverTooltip(null);
                  const name = id.includes('|') ? id : (friends.find((f) => f.id === id)?.name || 'Unknown');
                  if (coords) setHoverTooltip({ id, name, x: coords.x, y: coords.y });
                }}
                onEdgeClick={(s, t) => {
                  const shared = events.filter((ev) => ev.taggedFriendIds.includes(s) && ev.taggedFriendIds.includes(t));
                  setEdgeDetails({ a: s, b: t, events: shared });
                }}
              />

              {hoverTooltip && (
                <div style={{ position: 'fixed', left: hoverTooltip.x + 8, top: hoverTooltip.y + 8, zIndex: 60 }} className="p-2 bg-white border rounded shadow text-xs">
                  {hoverTooltip.name}
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">Node size = times tagged; line thickness = shared events between two connections.</div>
          </div>
        </div>
      </div>

      {editingEvent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">Edit Event</h4>
              <button onClick={() => setEditingEvent(null)} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="grid gap-2">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="px-3 py-2 border rounded" />
              <input value={editDate} onChange={(e) => setEditDate(e.target.value)} type="date" className="px-3 py-2 border rounded" />
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="px-3 py-2 border rounded" />

              <div>
                <div className="text-sm font-medium mb-2">Tag connections</div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                  {friends.map((f) => (
                    <label key={f.id} className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!editSelectedIds[f.id]} onChange={(e) => setEditSelectedIds((s) => ({ ...s, [f.id]: e.target.checked }))} />
                      <span>{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => {
                    if (!editingEvent) return;
                    const updated: EventRecord = {
                      id: editingEvent.id,
                      title: editTitle.trim() || editingEvent.title,
                      date: editDate ? new Date(editDate).toISOString() : editingEvent.date,
                      notes: editNotes.trim() || undefined,
                      taggedFriendIds: Object.keys(editSelectedIds).filter((k) => editSelectedIds[k]),
                      createdAt: editingEvent.createdAt,
                    };
                    saveEditEvent(updated);
                  }}
                  className="px-3 py-2 bg-blue text-white rounded"
                >
                  Save
                </button>
                <button onClick={() => setEditingEvent(null)} className="px-3 py-2 bg-gray-100 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {edgeDetails && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">Shared events</h4>
              <button onClick={() => setEdgeDetails(null)} className="text-sm text-gray-500">Close</button>
            </div>
            <div className="text-sm text-gray-700 mb-3">
              {friends.find((f) => f.id === edgeDetails.a)?.name || edgeDetails.a} &amp; {friends.find((f) => f.id === edgeDetails.b)?.name || edgeDetails.b}
            </div>
            <div className="max-h-60 overflow-auto space-y-2">
              {edgeDetails.events.length === 0 ? (
                <div className="text-sm text-gray-500">No shared events.</div>
              ) : (
                edgeDetails.events.map((ev) => (
                  <div key={ev.id} className="p-2 border rounded">
                    <div className="text-sm font-medium text-blue">{ev.title}</div>
                    <div className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString()}</div>
                    {ev.notes && <div className="text-xs text-gray-600 mt-1">{ev.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
