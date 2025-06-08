import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Copy } from "lucide-react";

interface SourceInputFormProps {
  onAnalyze: (sourceText: string) => void;
  isLoading: boolean;
}

const SourceInputForm: React.FC<SourceInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [sourceText, setSourceText] = useState('');
  const [charCount, setCharCount] = useState(0);

  const maxLength = 10000;
  const minLength = 50;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSourceText(text);
    setCharCount(text.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceText.trim().length >= minLength && !isLoading) {
      onAnalyze(sourceText.trim());
    }
  };

  const handlePasteExample = () => {
    const exampleText = `Beautiful 2-bedroom apartment in downtown Singapore
    
Rent: S$3,200/month
Deposit: 2 months
Available from: March 1st, 2024

Features:
- 2 bedrooms, 1 bathroom
- Fully furnished
- 850 sqft
- Pet-friendly
- Aircon, WiFi included
- Near MRT station
- Gym and pool in building

Located at 123 Orchard Road, Singapore. Walking distance to shopping malls and restaurants. Minimum 12-month lease. Contact for viewing!`;
    
    setSourceText(exampleText);
    setCharCount(exampleText.length);
  };

  const isValid = sourceText.trim().length >= minLength && sourceText.trim().length <= maxLength;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI-Powered Listing Creator
        </CardTitle>
        <CardDescription className="text-lg">
          Paste your rental property description and let AI extract structured information for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="sourceText" className="text-sm font-medium text-gray-700">
                Property Description
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasteExample}
                className="text-xs"
                disabled={isLoading}
              >
                <Copy className="w-3 h-3 mr-1" />
                Try Example
              </Button>
            </div>
            
            <Textarea
              id="sourceText"
              value={sourceText}
              onChange={handleTextChange}
              placeholder="Paste your rental listing description here...

Example:
- Property details (bedrooms, bathrooms, size)
- Rent amount and payment terms
- Location and address
- Amenities and features
- Availability dates
- Contact information

The more details you provide, the better our AI can extract accurate information!"
              className="min-h-[300px] resize-none"
              maxLength={maxLength}
              disabled={isLoading}
            />
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Minimum {minLength} characters required
              </span>
              <span className={charCount > maxLength * 0.9 ? 'text-orange-600' : ''}>
                {charCount.toLocaleString()} / {maxLength.toLocaleString()}
              </span>
            </div>
            
            {charCount > 0 && charCount < minLength && (
              <p className="text-sm text-orange-600">
                Please provide more details ({minLength - charCount} more characters needed)
              </p>
            )}
            
            {charCount > maxLength && (
              <p className="text-sm text-red-600">
                Text is too long. Please reduce by {charCount - maxLength} characters.
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for better results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include rent amount and currency (e.g., "$2,500/month" or "S$3,200/month")</li>
              <li>• Mention number of bedrooms and bathrooms</li>
              <li>• Add location details and address</li>
              <li>• List amenities and features</li>
              <li>• Include availability dates and lease terms</li>
            </ul>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </form>

        {isLoading && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              <div>
                <p className="font-medium text-purple-900">AI is analyzing your listing...</p>
                <p className="text-sm text-purple-700">This usually takes 5-15 seconds</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourceInputForm; 