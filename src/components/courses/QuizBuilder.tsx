
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { QuizQuestion } from '@/services/courseService';

interface QuizBuilderProps {
  value: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const DEFAULT_QUESTION: QuizQuestion = {
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  timeLimit: 60,
  reward: 100, // Fixed reward amount
};

const QuizBuilder: React.FC<QuizBuilderProps> = ({ value, onChange }) => {
  const [expanded, setExpanded] = useState<number[]>([0]);

  const toggleExpand = (index: number) => {
    if (expanded.includes(index)) {
      setExpanded(expanded.filter(i => i !== index));
    } else {
      setExpanded([...expanded, index]);
    }
  };

  const addQuestion = () => {
    const newQuestions = [...value, { ...DEFAULT_QUESTION }];
    onChange(newQuestions);
    setExpanded([...expanded, newQuestions.length - 1]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = value.filter((_, i) => i !== index);
    onChange(newQuestions);
    setExpanded(expanded.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, val: any) => {
    const newQuestions = [...value];
    newQuestions[index] = { ...newQuestions[index], [field]: val };
    onChange(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, val: string) => {
    const newQuestions = [...value];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = val;
    newQuestions[questionIndex] = { 
      ...newQuestions[questionIndex], 
      options: newOptions 
    };
    onChange(newQuestions);
  };

  const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...value];
    newQuestions[questionIndex] = { 
      ...newQuestions[questionIndex], 
      correctAnswer: optionIndex 
    };
    onChange(newQuestions);
  };

  // Ensure there's at least one question
  if (value.length === 0) {
    onChange([{ ...DEFAULT_QUESTION }]);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Quiz Questions</h3>
        <Button 
          type="button" 
          onClick={addQuestion} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {value.map((question, qIndex) => (
        <Card key={qIndex} className="border border-muted">
          <CardHeader className="p-4 pb-2 cursor-pointer flex flex-row items-center justify-between" onClick={() => toggleExpand(qIndex)}>
            <CardTitle className="text-base">
              Question {qIndex + 1}: {question.question ? question.question.substring(0, 40) + (question.question.length > 40 ? '...' : '') : '[No question text]'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {expanded.includes(qIndex) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          
          {expanded.includes(qIndex) && (
            <CardContent className="p-4 pt-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`question-${qIndex}`}>Question</Label>
                  <Textarea
                    id={`question-${qIndex}`}
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter your question here"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-2 mt-1">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1"
                        />
                        <div className="flex items-center ml-2">
                          <input
                            type="radio"
                            name={`correct-answer-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => setCorrectAnswer(qIndex, oIndex)}
                            id={`option-${qIndex}-${oIndex}`}
                            className="mr-2"
                          />
                          <Label htmlFor={`option-${qIndex}-${oIndex}`} className="text-sm cursor-pointer">
                            Correct
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`time-limit-${qIndex}`}>Time Limit (seconds)</Label>
                    <Input
                      id={`time-limit-${qIndex}`}
                      type="number"
                      value={question.timeLimit}
                      onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value) || 60)}
                      min="10"
                      max="300"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`reward-${qIndex}`}>Reward (₦)</Label>
                    <Input
                      id={`reward-${qIndex}`}
                      type="number"
                      value={100}
                      disabled
                      className="mt-1 bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Fixed reward of ₦100 per correct answer</p>
                  </div>
                </div>
                
                {value.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Remove Question
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default QuizBuilder;
