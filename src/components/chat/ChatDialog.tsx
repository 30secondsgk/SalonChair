
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, Store, Loader2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface ChatDialogProps {
  appointmentId: string;
  recipientName: string;
  isOwnerView?: boolean;
}

export function ChatDialog({ appointmentId, recipientName, isOwnerView = false }: ChatDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [messageText, setMessageText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !appointmentId) return null;
    return query(
      collection(db, 'appointments', appointmentId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [db, appointmentId]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !messageText.trim()) return;

    const messageRef = doc(collection(db, 'appointments', appointmentId, 'messages'));
    const textToSend = messageText;
    setMessageText('');

    await setDoc(messageRef, {
      id: messageRef.id,
      senderId: user.uid,
      text: textToSend,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl gap-2 h-10">
          <MessageSquare className="h-4 w-4" /> Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden flex flex-col h-[600px]">
        <DialogHeader className="p-6 bg-primary text-white shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              {isOwnerView ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm opacity-80 font-normal">Chatting with</p>
              <p className="font-bold">{recipientName}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages?.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages?.map((msg) => {
                const isMine = msg.senderId === user?.uid;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      isMine ? 'bg-primary text-white rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {format(new Date(msg.createdAt.seconds * 1000), 'p')}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 bg-muted/30 border-t shrink-0 flex gap-2">
          <Input 
            placeholder="Type a message..." 
            className="rounded-xl flex-1"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
