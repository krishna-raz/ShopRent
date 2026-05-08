import React from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { ScrollText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityLogs = () => {
  const { activityLogs } = useData();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Activity Logs" 
        description="A complete audit trail of system actions."
        icon={<ScrollText className="w-6 h-6 text-indigo-600" />}
      />

      <Card className="p-0 overflow-hidden">
        {activityLogs.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No activity recorded yet.</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <motion.div key={log._id} variants={item} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{log.action}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{log.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{log.user}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogs;
