import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { ShieldAlert, LogIn, FileText, Users, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';

export const Audit = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: str) => {
    switch(type) {
      case 'AUTH': return <LogIn className="w-4 h-4 text-blue-400" />;
      case 'DOCUMENT': 
      case 'RAG_QUERY': return <FileText className="w-4 h-4 text-primary" />;
      case 'TEAM': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Activity</h1>
        <p className="text-text-muted mt-2">Everything important, recorded. Immutable audit trail of system events.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-muted bg-surface border-b border-border uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">Resource</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-text-muted"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="max-w-sm mx-auto">
                          <div className="w-20 h-20 bg-surfaceHover rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="w-10 h-10 text-text-muted" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">No security events</h3>
                          <p className="text-text-muted">There are no audit logs recorded yet. System activity will automatically appear here.</p>
                        </div>
                      </td>
                    </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-surfaceHover">
                      <td className="px-6 py-4 text-text-muted">
                        {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4">USR_{log.user_id}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          {getIcon(log.resource_type)}
                          <span className="font-semibold text-white">{log.action}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-muted">
                        {log.resource_type} {log.resource_id ? `[${log.resource_id.substring(0,8)}...]` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          log.status === 'SUCCESS' ? 'text-green-400 bg-green-400/10' :
                          log.status === 'DENIED' ? 'text-red-400 bg-red-400/10 flex items-center gap-1 w-fit' :
                          'text-yellow-400 bg-yellow-400/10'
                        }`}>
                          {log.status === 'DENIED' && <AlertTriangle className="w-3 h-3"/>}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
