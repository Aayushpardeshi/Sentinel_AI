import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Users, Plus, UserPlus, Shield } from 'lucide-react';
import api from '../lib/api';

export const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      await api.post('/teams', { name: newTeamName });
      setNewTeamName('');
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (teamId: number) => {
    const userId = window.prompt("Enter the User ID of the new member:");
    if (!userId) return;
    const role = window.prompt("Enter role (MEMBER or ADMIN):", "MEMBER");
    if (!role) return;

    try {
      await api.post(`/teams/${teamId}/members`, { 
        user_id: parseInt(userId, 10), 
        role: role.toUpperCase() 
      });
      alert("Member added successfully!");
      fetchTeams();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to add member. Ensure you have OWNER/ADMIN rights and the User ID exists.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teams Management</h1>
        <p className="text-text-muted mt-2">Manage your organization's workspaces and access boundaries.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Plus className="w-5 h-5"/> Create Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <Input 
                label="Team Name" 
                placeholder="e.g. Engineering"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={!newTeamName.trim()}>
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Team Name</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-text-muted"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                  ) : teams.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="max-w-sm mx-auto">
                          <div className="w-20 h-20 bg-surfaceHover rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-text-muted" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">No active teams</h3>
                          <p className="text-text-muted mb-6">You are not part of any teams. Create a workspace to start collaborating securely.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => (
                      <tr key={team.id} className="border-b border-border hover:bg-surfaceHover">
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                          <Users className="w-4 h-4 text-primary" />
                          {team.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" />
                            {team.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleAddMember(team.id)}>
                            <UserPlus className="w-4 h-4" /> Add Member
                          </Button>
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
    </div>
  );
};
