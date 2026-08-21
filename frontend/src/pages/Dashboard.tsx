import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, MessageSquare, Shield, Users } from 'lucide-react';
import api from '../lib/api';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    documents: 0,
    teams: 0,
    logs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, teams, logs] = await Promise.all([
          api.get('/documents'),
          api.get('/teams'),
          api.get('/audit-logs')
        ]);
        setStats({
          documents: docs.data.length,
          teams: teams.data.length,
          logs: logs.data.length
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-background border border-border p-8 md:p-10 mb-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome to Sentinel.</h1>
          <p className="text-lg text-text-muted max-w-2xl">
            Your secure intelligence hub. All documents are encrypted and access-controlled. 
            Here is the overview of your organization's knowledge base.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,210,255,0.1)] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text-muted">Total Documents</h3>
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats.documents}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(138,43,226,0.1)] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text-muted">Active Teams</h3>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats.teams}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,210,255,0.1)] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text-muted">Security Events</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{stats.logs}</div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(255,255,255,0.05)] transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-text-muted">AI Queries</h3>
              <div className="p-2 bg-surfaceHover rounded-lg">
                <MessageSquare className="w-5 h-5 text-text-muted" />
              </div>
            </div>
            <div className="text-4xl font-bold text-text-muted">-</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
