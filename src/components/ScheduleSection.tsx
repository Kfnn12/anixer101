import { useState, useEffect } from 'react';
import { getSchedule, ScheduleItem } from '../lib/api';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export default function ScheduleSection() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await getSchedule(currentDate);
        setSchedule(data);
      } catch (err) {
        console.error("Failed to load schedule", err);
        setErrorMsg("Failed to load estimated schedule.");
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, [currentDate]);

  if (loading && schedule.length === 0) {
    return (
      <section className="py-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Estimated Schedule</h2>
        <div className="flex items-center justify-center p-8">
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        </div>
      </section>
    );
  }

  if (errorMsg && schedule.length === 0) return null; // Gracefully degrade by hiding schedule section

  if (schedule.length === 0 && !loading) return null;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Estimated Schedule
        </h2>
        <input 
          type="date" 
          value={currentDate} 
          onChange={(e) => setCurrentDate(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm md:text-base text-white focus:outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {schedule.map(item => (
          <Link key={item.id + item.time} to={item.url} className="glass-panel p-4 rounded-xl hover:bg-white/10 transition-colors flex flex-col justify-center border border-transparent hover:border-white/5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-accent text-sm font-bold bg-accent/10 px-2 py-0.5 rounded">{item.time}</span>
              {item.episode && (
                <span className="text-xs text-white/50 bg-white/5 px-2 py-0.5 rounded">Ep {item.episode}</span>
              )}
            </div>
            <h3 className="font-medium text-white line-clamp-2 text-sm leading-snug" title={item.title}>{item.title}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
