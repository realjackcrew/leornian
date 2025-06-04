import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getLogs, createLog } from '../api/log';

export default function Dashboard() {
    const { token, logout } = useContext(AuthContext);
    const [focus, setFocus] = useState('');
    const [sleep, setSleep] = useState('');
    const [hrv, setHrv] = useState('');
    const [strain, setStrain] = useState('');
    const [screen, setScreen] = useState('');
    const [diet, setDiet] = useState('');
    const [note, setNote] = useState('');
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (!token) return;
        getLogs(token).then(res => setLogs(res.data));
    }, [token]);

    const handleSubmit = async () => {
        try {
        await createLog(token, {
            focusScore: focus,
            sleepHours: sleep,
            hrv,
            strain,
            screenTime: screen,
            dietSummary: diet,
            notes: note
          });
            alert('Log submitted successfully');
            // setNote('');
            // const res = await getLogs(token);
            // setLogs(res.data);
        } catch (error) {
            console.error('Error submitting log:', error);
            alert('Error submitting log');
        }
    };

    if (!token) return <p className="text-center mt-10">Please log in.</p>;

    function test() {
        console.log('Submitting log:', { focus, sleep, hrv, strain, screen, diet, note });
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <button onClick={logout} className="text-red-500">Logout</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
                <input className="border p-2" type="number" placeholder="Focus Score (1–10)" value={focus} onChange={e => setFocus(+e.target.value)} />
                <input className="border p-2" type="number" placeholder="Sleep Hours" value={sleep} onChange={e => setSleep(+e.target.value)} />
                <input className="border p-2" type="number" placeholder="HRV" value={hrv} onChange={e => setHrv(+e.target.value)} />
                <input className="border p-2" type="number" placeholder="Strain" value={strain} onChange={e => setStrain(+e.target.value)} />
                <input className="border p-2" type="number" placeholder="Screen Time (min)" value={screen} onChange={e => setScreen(+e.target.value)} />
                <input className="border p-2" placeholder="Diet Summary" value={diet} onChange={e => setDiet(e.target.value)} />
                <textarea className="col-span-2 border p-2" placeholder="Notes..." value={note} onChange={e => setNote(e.target.value)} />
                <button className="col-span-2 bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Log Entry</button>
            </div>
            <ul className="space-y-2">
                {logs.map(log => (
                    <li key={log.id} className="p-3 border rounded text-sm space-y-1">
                        <p><strong>Focus:</strong> {log.focusScore} | <strong>Sleep:</strong> {log.sleepHours}h | <strong>HRV:</strong> {log.hrv}</p>
                        <p><strong>Strain:</strong> {log.strain} | <strong>Screen:</strong> {log.screenTime}min | <strong>Diet:</strong> {log.dietSummary}</p>
                        <p><strong>Notes:</strong> {log.notes}</p>
                        <p className="text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}