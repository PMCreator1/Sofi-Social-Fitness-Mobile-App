

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './views/Dashboard';
import { Explore } from './views/Explore';
import { Leaderboard } from './views/Leaderboard';
import { Profile } from './views/Profile';
import { Connect } from './views/Connect';
import { Coach } from './views/Coach'; // Import Coach
import { Onboarding } from './views/Onboarding';
import { PaymentModal } from './components/PaymentModal';
import { SuccessAnimation } from './components/SuccessAnimation';
import { Event, UserGoal, User, ActivityType, VirtualGroup, GroupChatMessage } from './types';

// Helper to generate dynamic dates relative to today
const getRelativeDate = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Initial Mock Data with Stable High Quality Images
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Lekki Bridge Sunrise Cycle',
    club: 'Lagos City Cyclists',
    organizer: {
        id: 'org1',
        name: 'Lagos City Cyclists',
        avatar: 'https://ui-avatars.com/api/?name=Lagos+Cyclists&background=f97316&color=fff',
        rating: 4.8,
        reviews: 128,
        bio: 'The biggest cycling community in Lagos. We organize daily rides for all skill levels. Safety first!',
        isVerified: true
    },
    type: 'Cycling',
    date: getRelativeDate(-1), // Yesterday (Completed)
    time: '06:00 AM',
    location: 'Lekki-Ikoyi Link Bridge, Lagos',
    attendees: 45,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80',
    description: 'A breezy morning ride across the bridge. Coffee at VI afterwards.',
    isJoined: true,
    status: 'completed',
    metrics: {
        distanceKm: 25.5,
        duration: '01:15:00',
        calories: 650,
        pace: '3:05'
    }
  },
  {
    id: '2',
    title: 'Jabi Lake Run Club',
    club: 'Capital City Runners',
    organizer: {
        id: 'org2',
        name: 'Capital City Runners',
        avatar: 'https://ui-avatars.com/api/?name=Capital+Runners&background=3b82f6&color=fff',
        rating: 4.9,
        reviews: 256,
        bio: 'Running is better together. Join us every evening at Jabi Lake for a structured run session.',
        isVerified: true
    },
    type: 'Running',
    date: getRelativeDate(0), // Today
    time: '05:30 PM',
    location: 'Jabi Lake Park, Abuja',
    attendees: 32,
    image: 'https://images.unsplash.com/photo-1552674605-46d527273191?auto=format&fit=crop&w=800&q=80',
    description: 'Evening run around the lake. All paces welcome! We usually split into groups: Pacers, Cruisers, and Walkers.',
    isJoined: false,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Sunday Morning Yoga',
    club: 'Breathe Lagos',
    organizer: {
        id: 'org3',
        name: 'Breathe Lagos',
        avatar: 'https://ui-avatars.com/api/?name=Breathe+Lagos&background=10b981&color=fff',
        rating: 4.7,
        reviews: 89,
        bio: 'Finding peace in the chaos of Lagos. Certified instructors guiding you through Hatha and Vinyasa flows.',
        isVerified: false
    },
    type: 'Yoga',
    date: getRelativeDate(1),
    time: '08:00 AM',
    location: 'Muri Okunola Park, VI',
    attendees: 15,
    image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=80',
    description: 'Relax and stretch with our expert instructors. Bring your own mat if you have one, or rent one for N500.',
    isJoined: true,
    status: 'upcoming',
    price: 2500,
    currency: 'NGN'
  },
  {
    id: '4',
    title: 'Amateur Boxing Sparring',
    club: 'Iron Fist Gym',
    organizer: {
        id: 'org4',
        name: 'Iron Fist Gym',
        avatar: 'https://ui-avatars.com/api/?name=Iron+Fist&background=ef4444&color=fff',
        rating: 4.5,
        reviews: 45,
        bio: 'Old school boxing gym in Surulere. We train champions.',
        isVerified: true
    },
    type: 'Boxing',
    date: getRelativeDate(2),
    time: '06:00 PM',
    location: 'Surulere National Stadium',
    attendees: 12,
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80',
    description: 'Sparring session for beginners and intermediates. Protective gear is mandatory.',
    isJoined: false,
    status: 'upcoming',
    price: 1000,
    currency: 'NGN'
  },
  {
    id: '5',
    title: 'Urban Skating Meetup',
    club: 'Skate Nigeria',
    organizer: {
        id: 'org5',
        name: 'Skate Nigeria',
        avatar: 'https://ui-avatars.com/api/?name=Skate+NG&background=8b5cf6&color=fff',
        rating: 4.6,
        reviews: 78,
        bio: 'Promoting roller sports across Nigeria. Monthly meetups in Lagos and Abuja.',
        isVerified: true
    },
    type: 'Skating',
    date: getRelativeDate(3),
    time: '04:00 PM',
    location: 'Eko Atlantic City',
    attendees: 28,
    image: 'https://images.unsplash.com/photo-1565264627763-8228dd9c8088?auto=format&fit=crop&w=800&q=80',
    description: 'Smooth roads and sea breeze. Bring your safety gear! We will be practicing slalom and speed skating.',
    isJoined: false,
    status: 'upcoming'
  },
  {
    id: '6',
    title: '5-a-side Football Match',
    club: 'Lagos Island League',
    type: 'Football',
    date: getRelativeDate(1),
    time: '07:00 PM',
    location: 'Campos Mini Stadium, Lagos',
    attendees: 10,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade8f55?auto=format&fit=crop&w=800&q=80',
    description: 'Casual match. Winner stays on. Turf shoes recommended.',
    isJoined: false,
    status: 'upcoming',
    price: 500,
    currency: 'NGN'
  },
  {
    id: '7',
    title: 'Morning Tabata Burn',
    club: 'FitFam Abuja',
    type: 'Tabata',
    date: getRelativeDate(2),
    time: '06:30 AM',
    location: 'Millennium Park, Abuja',
    attendees: 20,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    description: 'High intensity interval training to start your day. 20 seconds work, 10 seconds rest. 8 rounds.',
    isJoined: false,
    status: 'upcoming'
  },
  {
    id: '8',
    title: 'Zumba Dance Fitness',
    club: 'Zumba with Tola',
    type: 'Zumba',
    date: getRelativeDate(3),
    time: '05:00 PM',
    location: 'Ikeja City Mall (Rooftop)',
    attendees: 50,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    description: 'Dance away the calories with Afrobeat jams. No dance experience required!',
    isJoined: false,
    status: 'upcoming'
  },
  {
    id: '9',
    title: 'Weekend Golf Social',
    club: 'Ikoyi Club 1938',
    type: 'Golf',
    date: getRelativeDate(4),
    time: '09:00 AM',
    location: 'Ikoyi Club Golf Course',
    attendees: 8,
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    description: '18 holes and networking. Dress code strictly enforced.',
    isJoined: false,
    status: 'upcoming',
    price: 15000,
    currency: 'NGN'
  }
];

// Initial Mock Lobbies
const initialLobbies: VirtualGroup[] = [
    {
        id: 'v1',
        title: 'Lagos x Abuja 10k Run',
        activityType: 'Running',
        targetDistance: 10,
        startTime: '2023-10-28T07:00:00',
        status: 'recruiting',
        adminId: 'u1', 
        spotifyPlaylistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
        members: [
            { id: 'u1', name: 'Zainab', avatar: 'https://picsum.photos/seed/u1/100/100', points: 0, rank: 0, badges: [], status: 'ready', currentDistance: 0, location: 'Lagos' },
            { id: 'u2', name: 'Musa', avatar: 'https://picsum.photos/seed/u2/100/100', points: 0, rank: 0, badges: [], status: 'ready', currentDistance: 0, location: 'Abuja' },
            { id: 'u3', name: 'David', avatar: 'https://picsum.photos/seed/u3/100/100', points: 0, rank: 0, badges: [], status: 'ready', currentDistance: 0, location: 'PHC' },
        ],
        chatHistory: [
            {
                id: 'm1',
                senderId: 'u1',
                senderName: 'Zainab',
                senderAvatar: 'https://picsum.photos/seed/u1/100/100',
                text: 'Welcome everyone! Don\'t forget to stretch.',
                timestamp: '06:55 AM'
            }
        ],
        pastSessions: [],
        stats: {
            totalDistance: 120,
            totalSessions: 4,
            totalCalories: 8500
        },
        milestones: [
            { id: 'm1', name: 'Early Birds', icon: 'Sunrise', description: 'Completed 5 morning runs', unlockedAt: '2023-10-15' }
        ]
    },
    {
        id: 'v2',
        title: 'Sunday Cycle - Cross State',
        activityType: 'Cycling',
        targetDistance: 40,
        startTime: '2023-10-29T06:30:00',
        status: 'recruiting',
        adminId: 'u5',
        members: [
             { id: 'u5', name: 'Yusuf', avatar: 'https://picsum.photos/seed/u5/100/100', points: 0, rank: 0, badges: [], status: 'ready', currentDistance: 0, location: 'Kano' },
             { id: 'u6', name: 'Sarah', avatar: 'https://picsum.photos/seed/u6/100/100', points: 0, rank: 0, badges: [], status: 'ready', currentDistance: 0, location: 'Ibadan' },
        ],
        chatHistory: [],
        pastSessions: [],
        stats: {
             totalDistance: 0,
             totalSessions: 0,
             totalCalories: 0
        },
        milestones: []
    }
];

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [paymentEvent, setPaymentEvent] = useState<Event | null>(null);
  const [recentlyCompletedEvent, setRecentlyCompletedEvent] = useState<Event | null>(null);
  
  // Lifted Lobbies State (Simulating Persistence)
  const [lobbies, setLobbies] = useState<VirtualGroup[]>(initialLobbies);

  // Default User Data (Fresh Start)
  const [user, setUser] = useState<User>({
    id: '4',
    name: 'Guest',
    avatar: 'https://picsum.photos/seed/user/100/100', 
    points: 0,
    rank: 0,
    badges: []
  });

  const [goal, setGoal] = useState<UserGoal>({
    type: 'Weekly',
    targetDistanceKm: 20,
    currentDistanceKm: 0,
    streakDays: 0
  });

  const handleToggleJoin = (id: string) => {
    const event = events.find(e => e.id === id);
    if (!event) return;

    // If event is not joined and has a price > 0, show payment modal
    if (!event.isJoined && event.price && event.price > 0) {
        setPaymentEvent(event);
        return;
    }

    // Otherwise, toggle directly
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, isJoined: !e.isJoined };
      }
      return e;
    }));
  };

  const handlePaymentSuccess = () => {
      if (paymentEvent) {
          setEvents(prev => prev.map(e => {
              if (e.id === paymentEvent.id) {
                  return { ...e, isJoined: true };
              }
              return e;
          }));
          setPaymentEvent(null);
      }
  };

  const handleSaveActivity = (activityEvent: Event) => {
      setEvents(prev => [activityEvent, ...prev]);
      
      // Update Goal Progress
      if (activityEvent.metrics) {
          setGoal(prev => ({
              ...prev,
              currentDistanceKm: Number((prev.currentDistanceKm + activityEvent.metrics!.distanceKm).toFixed(2)),
              streakDays: prev.streakDays + 1 // Simple increment for demo
          }));
          
          setUser(prev => ({
              ...prev,
              points: prev.points + (activityEvent.metrics!.calories || 100)
          }));
      }

      // Trigger Success Animation
      setRecentlyCompletedEvent(activityEvent);
  };

  // Group Management Functions
  const handleCreateGroup = (newGroup: VirtualGroup) => {
    setLobbies(prev => [newGroup, ...prev]);
  };

  const handleUpdateGroup = (updatedGroup: VirtualGroup) => {
    setLobbies(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleDeleteGroup = (groupId: string) => {
    setLobbies(prev => prev.filter(g => g.id !== groupId));
  };

  const handlePlanNextSession = (groupId: string, details: { title: string; activityType: ActivityType; targetDistance: number; startTime: string }) => {
    setLobbies(prev => prev.map(group => {
        if (group.id === groupId) {
            // Archive current session
            const pastSession = {
                id: `sess-${Date.now()}`,
                title: group.title,
                date: new Date().toISOString().split('T')[0],
                activityType: group.activityType,
                distance: group.targetDistance
            };

            // Reset members for new session
            const resetMembers = group.members.map(m => ({
                ...m,
                status: 'ready' as const,
                currentDistance: 0,
                finalMetrics: undefined
            }));

            // Create system message
            const sysMsg: GroupChatMessage = {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'System',
                text: `New session planned: ${details.title} (${details.targetDistance}km) on ${new Date(details.startTime).toLocaleDateString()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: true
            };

            return {
                ...group,
                ...details,
                status: 'recruiting',
                members: resetMembers,
                pastSessions: [pastSession, ...(group.pastSessions || [])],
                chatHistory: [...group.chatHistory, sysMsg]
            };
        }
        return group;
    }));
  };

  const handleGroupMessage = (groupId: string, text: string) => {
    setLobbies(prev => prev.map(group => {
        if (group.id === groupId) {
            const newMessage: GroupChatMessage = {
                id: Date.now().toString(),
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                text: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            return {
                ...group,
                chatHistory: [...group.chatHistory, newMessage]
            };
        }
        return group;
    }));
  };

  const handleOnboardingComplete = (data: { name: string; location: string; interests: ActivityType[]; goal: number }) => {
    setUser(prev => ({
        ...prev,
        name: data.name,
    }));
    setGoal(prev => ({
        ...prev,
        targetDistanceKm: data.goal
    }));
    setShowOnboarding(false);
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            goal={goal} 
            upcomingEvents={events.filter(e => e.isJoined && e.status !== 'completed')}
            onToggleJoin={handleToggleJoin}
            onNavigate={setCurrentView}
          />
        );
      case 'explore':
        return (
          <Explore 
            events={events} 
            onToggleJoin={handleToggleJoin} 
            setEvents={setEvents}
          />
        );
      case 'coach':
        return <Coach userName={user.name} />;
      case 'teams':
        return (
            <Connect 
                user={user} 
                groups={lobbies}
                onSaveActivity={handleSaveActivity}
                onCreateGroup={handleCreateGroup}
                onUpdateGroup={handleUpdateGroup}
                onDeleteGroup={handleDeleteGroup}
                onPlanNextSession={handlePlanNextSession}
                onSendMessage={handleGroupMessage}
            />
        );
      case 'leaderboard':
        return <Leaderboard currentUser={user} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            goal={goal} 
            joinedEvents={events.filter(e => e.isJoined || e.status === 'completed')} 
          />
        );
      default:
        return <Dashboard 
            goal={goal} 
            upcomingEvents={events.filter(e => e.isJoined && e.status !== 'completed')}
            onToggleJoin={handleToggleJoin}
            onNavigate={setCurrentView}
        />;
    }
  };

  if (showOnboarding) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white font-sans pb-20">
      {renderView()}
      <Navbar currentView={currentView} setView={setCurrentView} />
      
      {paymentEvent && (
          <PaymentModal 
            event={paymentEvent} 
            onClose={() => setPaymentEvent(null)} 
            onConfirm={handlePaymentSuccess} 
          />
      )}

      {recentlyCompletedEvent && (
          <SuccessAnimation 
            event={recentlyCompletedEvent} 
            onClose={() => setRecentlyCompletedEvent(null)} 
          />
      )}
    </div>
  );
};

export default App;