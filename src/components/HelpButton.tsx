import React, { useEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Help"
        className="btn btn-secondary"
      >
        <HelpCircle className="w-5 h-5 text-blue" />
        <span className="sr-only">Help</span>
      </button>

      {open && (
        // Modal overlay
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div ref={modalRef} className="relative z-10 max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-blue">How Net-umbrella works</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
                <span className="sr-only">Close help</span>
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-800 space-y-3">
              <section>
                <h4 className="font-medium text-blue">Dashboard</h4>
                <p className="mt-1">See a summary of your network, quick stats, and jump to other areas like Analytics or Journal.</p>
              </section>

              <section>
                <h4 className="font-medium text-blue">Analytics</h4>
                <p className="mt-1">Visualize communication patterns across your connections to spot trends and gaps.</p>
              </section>

              <section>
                <h4 className="font-medium text-blue">Journal</h4>
                <p className="mt-1">Write notes about interactions, reflect on relationships, and track your progress over time.</p>
              </section>

              <section>
                <h4 className="font-medium text-blue">Events & Locations — in depth</h4>
                <div className="mt-1 space-y-2 text-sm text-gray-800">
                  <p className="">Overview: The Events tab is where you create and track meetings, meetups, and plans that involve your connections. Each event stores a title, a date, optional notes, and any friends you tag. Tagged friends are used to update the connection map so you can see who interacts together.</p>

                  <p className="font-medium">Creating an event</p>
                  <ul className="list-disc ml-5 text-xs text-gray-700">
                    <li><strong>Title</strong> — short description (e.g., "Coffee with Alex").</li>
                    <li><strong>Date</strong> — pick a single date. Use the date filter to find events across ranges.</li>
                    <li><strong>Notes</strong> — optional details, follow-ups, or context.</li>
                    <li><strong>Tag connections</strong> — check the friends involved. Tagging two or more friends creates stronger edges on the connection map.</li>
                  </ul>

                  <p className="font-medium">How events affect your network</p>
                  <p className="text-xs text-gray-700">When you tag connections on an event, the graph increases that node's count (how often a person appears in events) and strengthens edges between co-attendees. This helps surface which friends frequently appear in the same plans.</p>

                  <p className="font-medium">Filtering & searching</p>
                  <p className="text-xs text-gray-700">Use the search box to look for text in titles or notes. Use the friend dropdown to filter events involving a particular person. Use the date-from/date-to fields to narrow to a date range. Toggle "Graph from filtered" to visualize only the currently filtered events on the connection map.</p>

                  <p className="font-medium">Saving & sync</p>
                  <p className="text-xs text-gray-700">Events are saved locally in your browser for quick drafts. If you're signed in, events are also saved to the Supabase backend and will sync across devices. If an event fails to save remotely you may see it appear as a temporary item until it is persisted.</p>

                  <p className="font-medium">Tips & best practices</p>
                  <ul className="list-disc ml-5 text-xs text-gray-700">
                    <li>Give events clear titles and add a short note to remember context (why you met, follow-ups).</li>
                    <li>Tag people when they participate — that builds better analytics and shared-event history.</li>
                    <li>Use the connection map after creating events to spot clusters and missed relationships.</li>
                    <li>If you need recurring events, create one and copy the details when creating the next occurrence (recurring support is not automated).</li>
                  </ul>

                  <p className="font-medium">Common issues & troubleshooting</p>
                  <ul className="list-disc ml-5 text-xs text-gray-700">
                    <li>If an event is not visible, check the active filters (friend/date/search) — clear them to see everything.</li>
                    <li>If dates look off, confirm your browser's timezone and that the date field is filled correctly.</li>
                    <li>If tagged friends don't appear on the graph, try toggling "Graph from filtered" or refresh the page to reload synced data.</li>
                  </ul>

                  <div className="mt-2">
                    <Link to="/dashboard/events" className="inline-block btn btn-primary text-sm">Open Events page</Link>
                    <p className="mt-1 text-xs text-gray-500">Click the button to go straight to Events and try creating an event — the suggested event of the day can help you practice.</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="font-medium text-blue">Friends & Profiles</h4>
                <p className="mt-1">Add, view, and edit friends. Click a friend to see details, interactions, and analytics specific to them.</p>
              </section>

              <section>
                <h4 className="font-medium text-blue">Adding & Messaging</h4>
                <p className="mt-1">Use the Add Friend form to save contact info and preferred contact methods. Messaging analytics show frequency and balance of communication.</p>
              </section>

              <section>
                <h4 className="font-medium text-blue">Profile & Sign Out</h4>
                <p className="mt-1">Open your profile to update your avatar and details, or sign out from the profile menu.</p>
              </section>

              <p className="mt-2 text-xs text-gray-500">Tip: Press Esc or click outside this modal to close it.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
