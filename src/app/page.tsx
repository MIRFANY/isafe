"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
// ... other imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, User, Bot, ShieldCheck, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type UserProfile = "Student" | "Senior" | "Woman";
type AnalysisResult = {
  riskScore: "Low" | "Medium" | "High";
  explanation: string;
  redFlags: string[];
};
type ChatMessage = {
  role: "user" | "assistant" | "mentor";
  content: string;
};

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile>("Student");
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [simulationInput, setSimulationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [summary, setSummary] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleAnalysis = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const response = await fetch("/api/safehand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          input: inputText,
          userProfile,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        console.error("Failed to analyze text");
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
    setIsLoading(false);
  };

  const handleStartSimulation = async () => {
    setIsLoading(true);
    setChatMessages([]);
    setScore(100);
    setIsGameOver(false);
    setSummary("");
    try {
      const response = await fetch("/api/safehand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "simulate",
          userProfile,
          conversationHistory: [],
          score: 100,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.scammerResponse) {
          setChatMessages([
            { role: "assistant", content: result.scammerResponse },
          ]);
        }
      } else {
        console.error("Failed to start simulation");
      }
    } catch (error) {
      console.error("Error starting simulation:", error);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!simulationInput.trim() || isGameOver) return;

    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content: simulationInput },
    ];
    setChatMessages(newMessages);
    setSimulationInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/safehand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "simulate",
          userProfile,
          input: simulationInput,
          conversationHistory: newMessages.filter(msg => msg.role !== 'mentor'),
          score,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedMessages: ChatMessage[] = [...newMessages];
        
        if (result.feedback) {
          updatedMessages.push({ role: "mentor", content: result.feedback });
        }
        if (result.scammerResponse) {
          updatedMessages.push({ role: "assistant", content: result.scammerResponse });
        }

        setChatMessages(updatedMessages);
        setScore(prevScore => Math.max(0, prevScore + (result.scoreChange || 0)));

        if (result.isGameOver) {
          setIsGameOver(true);
          setSummary(result.summary);
        }
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsLoading(false);
  };

  const MotionButton = motion(Button);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900"
    >
      <div className="w-full max-w-4xl">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center items-center gap-3 mb-2">
            <ShieldCheck className="h-10 w-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-blue-800">
              SafeHand
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Your AI Digital Safety Companion
          </p>
        </motion.header>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <label htmlFor="user-profile" className="text-lg font-medium text-gray-700">
            I am a...
          </label>
          <Select
            onValueChange={(value: UserProfile) => setUserProfile(value)}
            defaultValue={userProfile}
          >
            <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm border-gray-300">
              <SelectValue placeholder="Select a profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Woman">Woman</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-blue-200/50 p-1 rounded-lg">
            <TabsTrigger value="shield">The Shield</TabsTrigger>
            <TabsTrigger value="training">Training Ground</TabsTrigger>
          </TabsList>
          <TabsContent value="shield">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
                  <CardHeader>
                    <CardTitle>Real-Time Threat Analysis</CardTitle>
                    <CardDescription>
                      Paste suspicious text to get a risk assessment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste message, email, or link here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[150px] text-base bg-white"
                    />
                    <MotionButton
                      onClick={handleAnalysis}
                      disabled={isLoading || !inputText.trim()}
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? "Scanning..." : "Scan for Danger"}
                    </MotionButton>
                  </CardContent>
                  <AnimatePresence>
                  {analysisResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <CardFooter className="flex flex-col items-start gap-4">
                        <h3 className="text-xl font-bold">Analysis Result:</h3>
                        <div
                          className={`w-full p-4 rounded-lg ${
                            analysisResult.riskScore === "High"
                              ? "bg-red-100 border-red-500"
                              : analysisResult.riskScore === "Medium"
                              ? "bg-yellow-100 border-yellow-500"
                              : "bg-green-100 border-green-500"
                          } border-l-4`}
                        >
                          <p className="font-bold text-lg">
                            Risk Score: {analysisResult.riskScore}
                          </p>
                          <p className="mt-2">{analysisResult.explanation}</p>
                          {analysisResult.redFlags &&
                            analysisResult.redFlags.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-semibold">Red Flags Found:</h4>
                                <ul className="list-disc list-inside mt-1">
                                  {analysisResult.redFlags.map((flag, index) => (
                                    <li key={index}>{flag}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </CardFooter>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="training">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-blue-900">Scam Simulation</CardTitle>
                    <CardDescription>
                      Your score reflects your scam detection skills.
                    </CardDescription>
                  </div>
                  <div className="text-right">
                      <motion.div 
                        key={score}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-blue-600"
                      >
                        {score}
                      </motion.div>
                      <div className="text-sm text-gray-500">Your Score</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={score} className="w-full" />
                  <div ref={chatContainerRef} className="w-full h-[450px] overflow-y-auto p-4 border rounded-lg bg-gray-50/50 space-y-6">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="mb-4 text-lg">Ready to test your skills?</p>
                        <MotionButton onClick={handleStartSimulation} disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {isLoading ? "Starting..." : "Start New Simulation"}
                        </MotionButton>
                      </div>
                    )}
                    <AnimatePresence>
                    {chatMessages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        const isMentor = msg.role === 'mentor';

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                          >
                            {isMentor ? (
                              <Alert className="bg-yellow-100 border-yellow-300 text-yellow-800 my-4">
                                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                                  <AlertTitle className="font-bold">Mentor's Tip</AlertTitle>
                                  <AlertDescription>
                                      {msg.content}
                                  </AlertDescription>
                              </Alert>
                            ) : (
                              <div
                                className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                              >
                                {!isUser && <Avatar className="h-9 w-9"><AvatarFallback>AI</AvatarFallback></Avatar>}
                                <div
                                  className={`p-3 rounded-xl max-w-lg shadow-md ${
                                    isUser
                                      ? "bg-blue-600 text-white rounded-br-none"
                                      : "bg-white text-gray-800 rounded-bl-none"
                                  }`}
                                >
                                  {msg.content}
                                </div>
                                 {isUser && <Avatar className="h-9 w-9"><AvatarFallback><User /></AvatarFallback></Avatar>}
                              </div>
                            )}
                          </motion.div>
                        )
                    })}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-2 items-center">
                      <Textarea
                          placeholder={isGameOver ? "The simulation has ended." : "Type your response..."}
                          value={simulationInput}
                          onChange={(e) => setSimulationInput(e.target.value)}
                          disabled={isLoading || chatMessages.length === 0 || isGameOver}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                              }
                          }}
                          className="flex-grow bg-white"
                      />
                      <MotionButton onClick={handleSendMessage} disabled={isLoading || chatMessages.length === 0 || !simulationInput.trim() || isGameOver} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Send</MotionButton>
                  </div>
                   {chatMessages.length > 0 && <MotionButton variant="outline" onClick={handleStartSimulation} disabled={isLoading} className="w-full sm:w-auto" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isLoading ? "Restarting..." : "Restart Simulation"}
                  </MotionButton>}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <AnimatePresence>
        {isGameOver && (
          <Dialog open={isGameOver} onOpenChange={setIsGameOver}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl text-blue-800">
                      <Award className="h-8 w-8 text-yellow-500" />
                      Simulation Over!
                  </DialogTitle>
                  <DialogDescription className="pt-4">
                    <p className="text-lg">Your final score is: <span className="font-bold text-blue-600">{score}</span></p>
                    <p className="mt-4">{summary}</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
