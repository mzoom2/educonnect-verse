
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PracticalTask } from '@/services/courseService';

interface PracticalTaskBuilderProps {
  value: PracticalTask;
  onChange: (task: PracticalTask) => void;
}

const DEFAULT_TASK: PracticalTask = {
  description: '',
  expectedOutcome: '',
  reward: 200 // Default reward amount
};

const PracticalTaskBuilder: React.FC<PracticalTaskBuilderProps> = ({ value, onChange }) => {
  // Initialize with default values if empty
  const task = value || DEFAULT_TASK;

  const updateField = (field: keyof PracticalTask, val: any) => {
    onChange({ ...task, [field]: val });
  };

  return (
    <Card className="border border-muted">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Practical Task</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <div>
          <Label htmlFor="task-description">Task Description</Label>
          <Textarea
            id="task-description"
            value={task.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Provide detailed instructions for what students need to accomplish"
            className="mt-1 min-h-32"
          />
        </div>
        
        <div>
          <Label htmlFor="expected-outcome">Expected Outcome</Label>
          <Textarea
            id="expected-outcome"
            value={task.expectedOutcome}
            onChange={(e) => updateField('expectedOutcome', e.target.value)}
            placeholder="Define clear criteria for successful completion"
            className="mt-1 min-h-20"
          />
        </div>
        
        <div>
          <Label htmlFor="task-reward">Reward Amount (₦)</Label>
          <Input
            id="task-reward"
            type="number"
            value={task.reward}
            onChange={(e) => updateField('reward', parseInt(e.target.value) || 200)}
            min="100"
            step="100"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">Recommended: ₦200-₦500 per task</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticalTaskBuilder;
