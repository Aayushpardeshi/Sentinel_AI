import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Upload, File, Trash2, Search, Loader2 } from 'lucide-react';
import api from '../lib/api';

export const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState('PERSONAL');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchDocuments();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scope', scope);
    if (scope === 'TEAM' && teamId) {
      formData.append('team_id', teamId);
    }

    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${documentId}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Knowledge Base</h1>
        <p className="text-text-muted mt-2">Securely manage the documents that power your organization's intelligence.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Upload className="w-5 h-5"/> Upload Document</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:bg-primary/5 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,210,255,0.15)] transition-all duration-300 cursor-pointer relative group overflow-hidden">
                <input 
                  type="file" 
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-base font-semibold text-white">{file ? file.name : "Select a PDF file"}</p>
                <p className="text-sm text-text-muted mt-2">Drag and drop or click to browse</p>
                
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Access Scope</label>
                <select 
                  className="w-full h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={scope === 'PERSONAL' ? 'PERSONAL' : teamId}
                  onChange={(e) => {
                    if (e.target.value === 'PERSONAL') {
                      setScope('PERSONAL');
                      setTeamId('');
                    } else {
                      setScope('TEAM');
                      setTeamId(e.target.value);
                    }
                  }}
                >
                  <option value="PERSONAL">Private Workspace (Only Me)</option>
                  {teams.length > 0 && <optgroup label="Team Workspaces">
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={!file || isUploading} isLoading={isUploading}>
                {isUploading ? 'Processing...' : 'Secure Upload'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
                <input 
                  placeholder="Search documents..." 
                  className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted bg-surface border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-medium">Filename</th>
                    <th className="px-6 py-3 font-medium">Scope</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-text-muted"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="max-w-sm mx-auto">
                          <div className="w-20 h-20 bg-surfaceHover rounded-full flex items-center justify-center mx-auto mb-6">
                            <File className="w-10 h-10 text-text-muted" />
                          </div>
                          <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
                          <p className="text-text-muted">Your knowledge base is empty. Upload your first PDF to begin extracting insights.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-border hover:bg-surfaceHover">
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                          <File className="w-4 h-4 text-primary" />
                          {doc.filename}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${doc.scope === 'PERSONAL' ? 'bg-primary/10 text-primary' : 'bg-purple-500/10 text-purple-500'}`}>
                            {doc.scope}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-muted">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
