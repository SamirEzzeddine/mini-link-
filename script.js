const { useState, useEffect, useMemo, memo } = React;

// --- ICONS ---
const Icon = memo(({ name, size = 24, className = "" }) => {
    if (!window.lucide?.icons) return null;
    const iconName = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    if (!window.lucide.icons[iconName]) return null;
    const svg = window.lucide.icons[iconName].toSvg({ width: size, height: size, class: className });
    return <span dangerouslySetInnerHTML={{ __html: svg }} className="inline-flex items-center justify-center" />;
});

// --- HELPERS ---
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const toISODate = (d) => d.toISOString().split('T')[0];
const getStartOfWeek = (d) => { const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); return new Date(date.setDate(diff)); };
const addDays = (d, days) => { const date = new Date(d); date.setDate(date.getDate() + days); return date; };

// --- 1. BOTTOM NAVIGATION (MOBILE DOCK) ---
const MobileNav = ({ view, setView }) => {
    const items = [
        { id: 'home', icon: 'layout-grid', label: 'Home' },
        { id: 'week', icon: 'calendar', label: 'Plan' },
        { id: 'day', icon: 'zap', label: 'Focus' },
        { id: 'projects', icon: 'layers', label: 'Work' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50 shadow-up">
            <div className="flex justify-around items-center h-16 pb-1">
                {items.map(item => (
                    <button key={item.id} onClick={() => setView(item.id)} className={`bottom-nav-item flex flex-col items-center justify-center w-full h-full gap-1 transition-all text-gray-400 ${view === item.id ? 'active' : ''}`}>
                        <div className="icon-bg p-1.5 rounded-xl transition-all duration-300">
                            <Icon name={item.icon} size={22} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- 2. HOME VIEW ---
const HomeView = ({ xp, stats, now }) => {
    const level = Math.floor(xp / 100) + 1;
    return (
        <div className="p-6 pb-32 space-y-6 animate-soft-rise">
            {/* HEADER / CLOCK */}
            <div className="flex justify-between items-center mt-4">
                <div>
                    <h1 className="font-display font-bold text-4xl text-aether-dark">Samir OS</h1>
                    <div className="text-xs font-bold text-aether-muted uppercase tracking-wider mt-1">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
                <div className="text-right">
                    <div className="font-display font-bold text-4xl text-aether-dark tracking-tight">
                        {now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            </div>

            {/* LEVEL CARD */}
            <div className="aerogel-card p-6 flex items-center gap-4">
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90"><circle className="stroke-gray-200 fill-none" cx="32" cy="32" r="28" strokeWidth="4" /><circle className="stroke-aether-accent fill-none" cx="32" cy="32" r="28" strokeWidth="4" strokeDasharray={2*Math.PI*28} strokeDashoffset={2*Math.PI*28 * (1 - (xp % 100)/100)} strokeLinecap="round" /></svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-aether-dark">Lvl {level}</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-aether-muted uppercase">Current Status</div>
                    <div className="font-bold text-xl text-aether-dark">System Online</div>
                </div>
            </div>

            {/* CURRENT TASK */}
            <div className="aerogel-card p-6 bg-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-aether-sand/40 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-aether-accent">
                        <Icon name="radio" size={16} className="animate-pulse"/>
                        <span className="text-xs font-bold uppercase tracking-widest">Now Active</span>
                    </div>
                    <h2 className="font-display font-bold text-3xl text-aether-dark mb-2 leading-tight">{stats.currentTask ? stats.currentTask.title : "Free Time"}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {stats.currentTask ? `Scheduled until ${stats.currentTask.startHour + stats.currentTask.duration}:00.` : "No specific directives. Relax or plan ahead."}
                    </p>
                </div>
            </div>

            {/* UP NEXT LIST */}
            <div className="aerogel-card p-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-aether-muted uppercase tracking-wider">Up Next</span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{stats.tasksLeft} Pending</span>
                </div>
                <div className="space-y-3">
                    {stats.upcomingTodos.map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-white/50 border border-white rounded-xl shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-aether-secondary"></div>
                            <span className="text-sm font-medium text-aether-dark truncate">{t.text}</span>
                        </div>
                    ))}
                    {stats.upcomingTodos.length === 0 && <div className="text-center text-sm text-gray-400 py-2">All caught up!</div>}
                </div>
            </div>
        </div>
    );
};

// --- 3. PLANNER VIEW (MOBILE) ---
const PlannerView = ({ schedule, setSchedule, now }) => {
    const [focusDate, setFocusDate] = useState(new Date(now));
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null); // { id, title, day, hour, duration }

    const startOfWk = getStartOfWeek(focusDate);
    const weekDates = Array.from({length: 7}, (_, i) => addDays(startOfWk, i));

    const navigate = (dir) => { const d = new Date(focusDate); d.setDate(d.getDate() + (dir * 7)); setFocusDate(d); };
    const goToToday = () => setFocusDate(new Date());

    // "Tap to Schedule" Logic
    const handleSlotTap = (dateStr, hour) => {
        // Check if task exists
        const existing = schedule.find(t => t.date === dateStr && hour >= t.startHour && hour < t.startHour + t.duration);
        if (existing) {
            setEditData(existing);
        } else {
            setEditData({ id: null, title: "", date: dateStr, startHour: hour, duration: 1 });
        }
        setModalOpen(true);
    };

    const saveTask = () => {
        if (!editData.title.trim()) return;
        if (editData.id) {
            // Update
            setSchedule(schedule.map(t => t.id === editData.id ? editData : t));
        } else {
            // Create
            setSchedule([...schedule, { ...editData, id: Date.now().toString() }]);
        }
        setModalOpen(false);
    };

    const deleteTask = () => {
        if(editData.id) setSchedule(schedule.filter(t => t.id !== editData.id));
        setModalOpen(false);
    };

    return (
        <div className="h-screen flex flex-col bg-aether-bg pb-20">
            {/* NAV HEADER */}
            <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 flex justify-between items-center shadow-sm">
                <div className="flex gap-2">
                        {/* BLACK SQUARE BUTTONS WITH WHITE ARROWS */}
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#1D1D1F] rounded-lg flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                        <Icon name="arrow-left" size={20} strokeWidth={3} />
                    </button>
                    <button onClick={() => navigate(1)} className="w-10 h-10 bg-[#1D1D1F] rounded-lg flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                        <Icon name="arrow-right" size={20} strokeWidth={3} />
                    </button>
                </div>
                <div className="text-center">
                    <div className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Current Week</div>
                    <div className="text-sm font-bold text-aether-dark">{MONTHS[focusDate.getMonth()]} {focusDate.getFullYear()}</div>
                </div>
                <button onClick={goToToday} className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-aether-dark font-bold text-xs active:bg-gray-200">
                    TDY
                </button>
            </div>

            {/* SCROLLABLE GRID */}
            <div className="flex-1 overflow-auto no-scrollbar relative bg-white">
                <div className="flex min-w-[120vw]"> 
                    {/* TIME COLUMN (STICKY) */}
                    <div className="sticky-col w-14 pt-12 flex-shrink-0 z-30 bg-[#F9FAFB]">
                        {HOURS.map(h => (
                            <div key={h} className="h-16 text-[10px] font-bold text-gray-400 flex items-start justify-center pt-1 border-b border-gray-100">
                                {h}:00
                            </div>
                        ))}
                    </div>

                    {/* DAYS COLUMNS */}
                    {weekDates.map((date, i) => {
                        const dateStr = toISODate(date);
                        const isToday = dateStr === toISODate(now);
                        const dayTasks = schedule.filter(t => t.date === dateStr);

                        return (
                            <div key={i} className="flex-1 min-w-[100px] border-r border-gray-100 relative">
                                {/* DAY HEADER */}
                                <div className={`h-12 flex flex-col items-center justify-center border-b sticky top-0 z-20 ${isToday ? 'bg-aether-accent text-white shadow-md' : 'bg-white text-gray-500'}`}>
                                    <span className="text-[9px] font-bold uppercase">{DAYS[i]}</span>
                                    <span className="text-base font-bold leading-none">{date.getDate()}</span>
                                </div>

                                {/* GRID CELLS */}
                                <div className="relative bg-white">
                                    {HOURS.map(h => (
                                        <div key={h} onClick={() => handleSlotTap(dateStr, h)} className="h-16 border-b border-gray-50 active:bg-blue-50 transition-colors"></div>
                                    ))}

                                    {/* TASKS */}
                                    {dayTasks.map(task => (
                                        <div key={task.id} onClick={(e) => { e.stopPropagation(); handleSlotTap(dateStr, task.startHour); }}
                                            className="absolute inset-x-1 rounded-lg bg-[#1D1D1F] text-white p-2 shadow-md flex flex-col justify-center overflow-hidden border-l-2 border-aether-accent active:scale-95 transition-transform z-10"
                                            style={{ top: `${task.startHour * 64 + 2}px`, height: `${task.duration * 64 - 4}px` }}
                                        >
                                            <div className="font-bold text-xs leading-tight truncate">{task.title}</div>
                                            <div className="text-[9px] opacity-70">{task.duration}h</div>
                                        </div>
                                    ))}
                                    
                                    {/* CURRENT TIME LINE */}
                                    {isToday && <div className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center" style={{ top: `${(now.getHours() * 64) + (now.getMinutes() * (64/60))}px` }}>
                                        <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                                    </div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="bg-white w-full sm:w-auto sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative z-10 animate-soft-rise">
                        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>
                        <h3 className="text-xl font-display font-bold mb-6 text-aether-dark">{editData.id ? 'Edit Task' : 'New Task'}</h3>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Title</label>
                                <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-lg border-transparent focus:bg-white focus:border-aether-accent border-2 outline-none transition-colors" placeholder="Task Name..." autoFocus />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Start Time</label>
                                    <select value={editData.startHour} onChange={e => setEditData({...editData, startHour: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold appearance-none">
                                        {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Duration (h)</label>
                                    <input type="number" min="1" max="8" value={editData.duration} onChange={e => setEditData({...editData, duration: parseInt(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-center" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {editData.id && (
                                <button onClick={deleteTask} className="p-4 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 hover:bg-red-100">
                                    <Icon name="trash" size={20} />
                                </button>
                            )}
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100">Cancel</button>
                            <button onClick={saveTask} className="flex-[2] py-4 rounded-2xl font-bold text-white bg-aether-dark shadow-lg shadow-gray-300">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 4. FOCUS / DAY VIEW ---
const FocusView = ({ todos, setTodos }) => {
    const [timer, setTimer] = useState(25*60);
    const [active, setActive] = useState(false);
    const [input, setInput] = useState("");

    useEffect(() => {
        let int = null;
        if (active && timer > 0) int = setInterval(() => setTimer(t => t-1), 1000);
        return () => clearInterval(int);
    }, [active, timer]);

    const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const addTodo = () => { if(input.trim()){ setTodos([...todos, {id:Date.now(), text:input, done:false}]); setInput(""); } };

    return (
        <div className="p-6 pb-32 space-y-8 animate-soft-rise">
            {/* TIMER CARD */}
            <div className="aerogel-card p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="text-xs font-bold uppercase text-aether-muted tracking-[0.3em] mb-6">Session Timer</div>
                    <div className="text-8xl font-display font-bold text-aether-dark mb-8 tracking-tighter">{fmt(timer)}</div>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setActive(!active)} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${active ? 'bg-aether-accent' : 'bg-aether-dark'}`}>
                            <Icon name={active ? "pause" : "play"} size={28} fill="currentColor" />
                        </button>
                        <button onClick={() => {setActive(false); setTimer(25*60)}} className="w-16 h-16 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center active:bg-gray-200">
                            <Icon name="rotate-ccw" size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* TODO LIST */}
            <div>
                <h3 className="font-display font-bold text-2xl mb-4 ml-1">Tasks</h3>
                <div className="flex gap-2 mb-4">
                    <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm outline-none focus:border-aether-accent" placeholder="Add a new task..." />
                    <button onClick={addTodo} className="w-14 rounded-2xl bg-aether-dark text-white flex items-center justify-center shadow-md"><Icon name="plus" size={24} /></button>
                </div>
                <div className="space-y-3">
                    {todos.map(t => (
                        <div key={t.id} onClick={() => setTodos(todos.map(x => x.id === t.id ? {...x, done: !x.done} : x))}
                            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.98] ${t.done ? 'bg-transparent border-transparent opacity-50' : 'bg-white border-gray-100 shadow-sm'}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${t.done ? 'bg-aether-secondary border-aether-secondary text-white' : 'border-gray-300'}`}>
                                {t.done && <Icon name="check" size={14} strokeWidth={4} />}
                            </div>
                            <span className={`flex-1 font-medium text-lg ${t.done ? 'line-through' : ''}`}>{t.text}</span>
                            
                            {/* VISIBLE RED DELETE BUTTON */}
                            <button onClick={(e) => { e.stopPropagation(); setTodos(todos.filter(x => x.id !== t.id)); }} className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-red-100 bg-red-50 text-red-500 active:bg-red-500 active:text-white active:border-red-500 transition-colors">
                                <Icon name="trash-2" size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- 5. PROJECTS VIEW ---
const ProjectsView = ({ projects, setProjects }) => {
    const [newProj, setNewProj] = useState("");
    const addProj = () => { if(newProj) { setProjects([...projects, {id:Date.now(), title:newProj, progress:0}]); setNewProj(""); } };

    return (
        <div className="p-6 pb-32 space-y-6 animate-soft-rise">
                <h1 className="font-display font-bold text-4xl mt-4 mb-6">Projects</h1>
                
                <div className="flex gap-2 mb-8">
                <input value={newProj} onChange={e=>setNewProj(e.target.value)} className="flex-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm outline-none" placeholder="New Project Name..." />
                <button onClick={addProj} className="px-6 rounded-2xl bg-aether-secondary text-white font-bold shadow-md">Add</button>
                </div>

                <div className="space-y-6">
                {projects.map(p => (
                    <div key={p.id} className="aerogel-card p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-xl">{p.title}</h3>
                            <button onClick={() => setProjects(projects.filter(x=>x.id !== p.id))} className="text-red-400 p-2"><Icon name="trash" size={16}/></button>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-aether-leaf" style={{width: `${p.progress}%`}}></div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Progress</span>
                            <span>{p.progress}%</span>
                        </div>
                        <input type="range" value={p.progress} onChange={e=>setProjects(projects.map(x => x.id===p.id ? {...x, progress: parseInt(e.target.value)} : x))} className="w-full mt-4 accent-aether-dark" />
                    </div>
                ))}
                </div>
        </div>
    );
}

// --- APP ROOT ---
const App = () => {
    const [view, setView] = useState('home');
    const [xp, setXp] = useState(0);
    const [now, setNow] = useState(new Date());
    
    // State
    const today = toISODate(new Date());
    const [schedule, setSchedule] = useState([
        {id:'1',title:'Morning Routine',duration:1,date: today,startHour:8},
        {id:'2',title:'Deep Work',duration:2,date: today,startHour:10}
    ]);
    const [todos, setTodos] = useState([
        {id:1,text:"Check Emails",done:false},
        {id:2,text:"Design Review",done:true}
    ]);
    const [projects, setProjects] = useState([
        {id:1,title:"Mobile App",progress:65},
        {id:2,title:"Website",progress:30}
    ]);

    useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

    const stats = { 
        tasksLeft: todos.filter(t=>!t.done).length, 
        upcomingTodos: todos.filter(t=>!t.done).slice(0,3),
        currentTask: schedule.find(t => t.date === toISODate(now) && now.getHours() >= t.startHour && now.getHours() < t.startHour + t.duration)
    };

    return (
        <div className="min-h-screen w-full bg-aether-bg">
            {/* Background Petals */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="petal" style={{left:'10%', animationDuration:'10s'}}></div>
                <div className="petal" style={{left:'70%', animationDuration:'15s', animationDelay:'2s'}}></div>
            </div>

            {/* Views */}
            <div className="relative z-10">
                {view === 'home' && <HomeView xp={xp} stats={stats} now={now} />}
                {view === 'week' && <PlannerView schedule={schedule} setSchedule={setSchedule} now={now} />}
                {view === 'day' && <FocusView todos={todos} setTodos={setTodos} />}
                {view === 'projects' && <ProjectsView projects={projects} setProjects={setProjects} />}
            </div>

            <MobileNav view={view} setView={setView} />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
