import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches ALL signals in a single query and returns:
 *   signalsByItem  — { [itemId]: { support, oppose, concern, note, total } }
 *   mySignalsByItem — { [itemId]: signal row } for the current user
 *   refreshSignals — call after a save/delete to re-fetch
 *   newSinceLastVisit — count of signals created after localStorage timestamp
 */
export function useSignals(user) {
  const [signalsByItem, setSignalsByItem]     = useState({});
  const [mySignalsByItem, setMySignalsByItem] = useState({});
  const [newCount, setNewCount]               = useState(0);
  const [loading, setLoading]                 = useState(true);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from("signals")
      .select("id, item_id, signal_type, user_id, comment, updated_at");

    if (error || !data) { setLoading(false); return; }

    const bySig  = {};
    const myBySig = {};
    const lastVisit = parseInt(localStorage.getItem("rh_signals_last_visit") || "0", 10);
    let newSince = 0;

    data.forEach(row => {
      if (!bySig[row.item_id]) {
        bySig[row.item_id] = { support: 0, oppose: 0, concern: 0, note: 0, total: 0 };
      }
      bySig[row.item_id][row.signal_type]++;
      bySig[row.item_id].total++;

      if (user && row.user_id === user.id) {
        myBySig[row.item_id] = row;
      }

      const ts = new Date(row.updated_at).getTime();
      if (ts > lastVisit && (!user || row.user_id !== user.id)) newSince++;
    });

    setSignalsByItem(bySig);
    setMySignalsByItem(myBySig);
    setNewCount(newSince);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function markVisited() {
    localStorage.setItem("rh_signals_last_visit", Date.now().toString());
    setNewCount(0);
  }

  return { signalsByItem, mySignalsByItem, refreshSignals: fetchAll, newCount, markVisited, loading };
}
