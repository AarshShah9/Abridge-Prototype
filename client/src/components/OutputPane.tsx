import React from 'react';
import type { VisitDiffOutput } from '../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';

interface OutputPaneProps {
  output: VisitDiffOutput | null;
  isLoading: boolean;
  error: string | null;
}

const OutputPane: React.FC<OutputPaneProps> = ({ output, isLoading, error }) => {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast notification here
  };

  const handleDownloadJSON = () => {
    if (!output) return;
    
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visit-diff.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background-secondary p-6 rounded-lg border border-border">
        <div className="text-center">
          <p className="text-lg font-medium text-secondary">Analyzing differences...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-background-secondary p-6 rounded-lg border border-border">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">Error</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="h-full flex items-center justify-center bg-background-secondary p-6 rounded-lg border border-border">
        <div className="text-center">
          <p className="text-lg font-medium text-secondary">No results yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Enter a prior note and current transcript, then click Generate Visit Diff
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 bg-background-secondary p-6 rounded-lg border border-border overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-secondary">Results</h2>
        <div className="flex space-x-2">
          <Button onClick={() => handleCopy(JSON.stringify(output, null, 2))} variant="outline" size="sm">
            Copy All
          </Button>
          <Button onClick={handleDownloadJSON} variant="outline" size="sm">
            Download JSON
          </Button>
        </div>
      </div>
      
      <div className="bg-accent/10 text-secondary p-3 rounded-md text-sm">
        {output.safe_disclaimer}
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="summary">Delta Summary</TabsTrigger>
          <TabsTrigger value="changes">Changes</TabsTrigger>
          <TabsTrigger value="nudges">Nudges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delta Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {output.delta_summary.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handleCopy(output.delta_summary.map(item => `• ${item}`).join('\n'))}
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Copy Summary
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="changes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(output.changes).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <ul className="pl-5 space-y-1">
                        {items.map((item: string, index: number) => (
                          <li key={index} className="list-disc">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="nudges" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Nudge</CardTitle>
            </CardHeader>
            <CardContent>
              {output.nudges.map((nudge, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">{nudge.title}</h4>
                  <p className="text-sm">{nudge.description}</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm italic">"{nudge.evidence_span}"</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutputPane;
