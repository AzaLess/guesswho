import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitFact } from "../api";

export default function SubmitFacts() {
  const player = JSON.parse(localStorage.getItem("player") || "{}");
  const [facts, setFacts] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleChange = (i: number, value: string) => {
    const arr = [...facts];
    arr[i] = value;
    setFacts(arr);
  };

  const handleSubmit = async () => {
    if (facts.some(f => !f.trim())) return alert("Введите минимум 3 факта!");
    setLoading(true);
    try {
      for (let fact of facts) {
        await submitFact(player.id, fact);
      }
      setDone(true);
      navigate("/waiting");
    } catch {
      alert("Ошибка при отправке фактов");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h2>📝 Введите 3 факта о себе</h2>
      {facts.map((fact, i) => (
        <input
          key={i}
          placeholder={`💡 Факт ${i + 1}`}
          value={fact}
          onChange={e => handleChange(i, e.target.value)}
        />
      ))}
      <button onClick={handleSubmit} disabled={loading || done}>
        {loading ? "📤 Отправка..." : done ? "✅ Готово!" : "📨 Отправить"}
      </button>
    </div>
  );
}
