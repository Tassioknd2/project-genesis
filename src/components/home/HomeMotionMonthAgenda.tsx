import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  HeartPulse,
  MousePointer,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Appointment {
  time: string;
  patient: string;
  type: "EXA" | "CON";
}

export interface DaySchedule {
  day: number;
  month: "AGO" | "SET" | "OUT";
  isOutside?: boolean;
  dayOfWeek: string;
  dayTitle: string;
  load: number;
  consultas: number;
  exames: number;
  appointments: Appointment[];
}

// Complete data matching the image and expanding for animated hover states
const SCHEDULE_DATA: Record<number, DaySchedule> = {
  1: {
    day: 1,
    month: "SET",
    dayOfWeek: "TER",
    dayTitle: "TERÇA-FEIRA, 1 SET",
    load: 6,
    consultas: 2,
    exames: 4,
    appointments: [
      { time: "08:15", patient: "Maria Silva", type: "EXA" },
      { time: "09:00", patient: "João Ferreira", type: "EXA" },
      { time: "09:45", patient: "Ana Beatriz", type: "CON" },
      { time: "10:30", patient: "Carlos Eduardo", type: "EXA" },
      { time: "11:15", patient: "Lúcia Mendes", type: "CON" },
      { time: "12:00", patient: "Rodrigo Santos", type: "EXA" },
    ],
  },
  2: {
    day: 2,
    month: "SET",
    dayOfWeek: "QUA",
    dayTitle: "QUARTA-FEIRA, 2 SET",
    load: 5,
    consultas: 3,
    exames: 2,
    appointments: [
      { time: "08:30", patient: "Cláudio Ramos", type: "CON" },
      { time: "09:15", patient: "Patrícia Vasconcelos", type: "EXA" },
      { time: "10:00", patient: "Helena Duarte", type: "CON" },
      { time: "10:45", patient: "Marcos Vinicius", type: "EXA" },
      { time: "11:30", patient: "Sandra Nogueira", type: "CON" },
    ],
  },
  3: {
    day: 3,
    month: "SET",
    dayOfWeek: "QUI",
    dayTitle: "QUINTA-FEIRA, 3 SET",
    load: 10,
    consultas: 4,
    exames: 6,
    appointments: [
      { time: "08:10", patient: "Roberto Lima", type: "EXA" },
      { time: "08:45", patient: "Solange Ribeiro", type: "EXA" },
      { time: "09:35", patient: "Tereza Campos", type: "CON" },
      { time: "10:25", patient: "Beatriz Hoffmann", type: "CON" },
      { time: "11:00", patient: "Henrique Prado", type: "CON" },
      { time: "11:50", patient: "Eduardo Sanches", type: "CON" },
      { time: "12:40", patient: "Fernando Alcântara", type: "EXA" },
      { time: "14:15", patient: "Camila Rocha", type: "EXA" },
      { time: "15:00", patient: "Gustavo Neves", type: "EXA" },
      { time: "15:45", patient: "Priscila Barros", type: "EXA" },
    ],
  },
  4: {
    day: 4,
    month: "SET",
    dayOfWeek: "SEX",
    dayTitle: "SEXTA-FEIRA, 4 SET",
    load: 9,
    consultas: 3,
    exames: 6,
    appointments: [
      { time: "08:00", patient: "Sérgio Antunes", type: "EXA" },
      { time: "08:40", patient: "Vanessa Pires", type: "EXA" },
      { time: "09:20", patient: "Thiago Morais", type: "CON" },
      { time: "10:00", patient: "Daniela Farias", type: "EXA" },
      { time: "10:45", patient: "Rogério Castro", type: "CON" },
      { time: "11:30", patient: "Marcela Guimarães", type: "EXA" },
      { time: "14:00", patient: "Fábio Meireles", type: "CON" },
      { time: "14:40", patient: "Renata Lemos", type: "EXA" },
      { time: "15:20", patient: "André Silveira", type: "EXA" },
    ],
  },
  5: {
    day: 5,
    month: "SET",
    dayOfWeek: "SÁB",
    dayTitle: "SÁBADO, 5 SET",
    load: 3,
    consultas: 1,
    exames: 2,
    appointments: [
      { time: "08:30", patient: "Igor Valença", type: "EXA" },
      { time: "09:15", patient: "Miriam Souza", type: "CON" },
      { time: "10:00", patient: "Lucas Bittencourt", type: "EXA" },
    ],
  },
  6: {
    day: 6,
    month: "SET",
    dayOfWeek: "DOM",
    dayTitle: "DOMINGO, 6 SET",
    load: 0,
    consultas: 0,
    exames: 0,
    appointments: [],
  },
  7: {
    day: 7,
    month: "SET",
    dayOfWeek: "SEG",
    dayTitle: "SEGUNDA-FEIRA, 7 SET",
    load: 6,
    consultas: 2,
    exames: 4,
    appointments: [
      { time: "08:00", patient: "Julio Cesar", type: "EXA" },
      { time: "08:45", patient: "Larissa Dias", type: "CON" },
      { time: "09:30", patient: "Vinicius Leão", type: "EXA" },
      { time: "10:15", patient: "Débora Brandão", type: "CON" },
      { time: "11:00", patient: "Elza Martins", type: "EXA" },
      { time: "11:45", patient: "Hugo Paes", type: "EXA" },
    ],
  },
  8: {
    day: 8,
    month: "SET",
    dayOfWeek: "TER",
    dayTitle: "TERÇA-FEIRA, 8 SET",
    load: 7,
    consultas: 3,
    exames: 4,
    appointments: [
      { time: "08:15", patient: "Geraldo Prado", type: "EXA" },
      { time: "09:00", patient: "Irene Caldas", type: "CON" },
      { time: "09:45", patient: "Maurício Siqueira", type: "EXA" },
      { time: "10:30", patient: "Valéria Matos", type: "CON" },
      { time: "11:15", patient: "Otávio Rangel", type: "EXA" },
      { time: "14:00", patient: "Simone Borges", type: "CON" },
      { time: "14:45", patient: "Cristiano Maia", type: "EXA" },
    ],
  },
  9: {
    day: 9,
    month: "SET",
    dayOfWeek: "QUA",
    dayTitle: "QUARTA-FEIRA, 9 SET",
    load: 8,
    consultas: 3,
    exames: 5,
    appointments: [
      { time: "08:00", patient: "Tânia Fagundes", type: "EXA" },
      { time: "08:45", patient: "Marcelo Diniz", type: "CON" },
      { time: "09:30", patient: "Letícia Ribeiro", type: "EXA" },
      { time: "10:15", patient: "Bruno Carvalho", type: "EXA" },
      { time: "11:00", patient: "Marta Nogueira", type: "CON" },
      { time: "11:45", patient: "Alexandre Pires", type: "EXA" },
      { time: "14:00", patient: "Renata Silveira", type: "CON" },
      { time: "14:45", patient: "Felipe Macedo", type: "EXA" },
    ],
  },
  10: {
    day: 10,
    month: "SET",
    dayOfWeek: "QUI",
    dayTitle: "QUINTA-FEIRA, 10 SET",
    load: 10,
    consultas: 4,
    exames: 6,
    appointments: [
      { time: "08:00", patient: "Arthur Brandão", type: "EXA" },
      { time: "08:45", patient: "Denise Fontana", type: "EXA" },
      { time: "09:30", patient: "Lucas Peixoto", type: "CON" },
      { time: "10:15", patient: "Mônica Arruda", type: "CON" },
      { time: "11:00", patient: "Juliana Paiva", type: "EXA" },
      { time: "11:45", patient: "Wilson Guedes", type: "CON" },
      { time: "14:00", patient: "Tatiana Leal", type: "EXA" },
      { time: "14:45", patient: "Bruno Cerqueira", type: "CON" },
      { time: "15:30", patient: "Cecília Viana", type: "EXA" },
      { time: "16:15", patient: "Marcelo Dantas", type: "EXA" },
    ],
  },
  18: {
    day: 18,
    month: "SET",
    dayOfWeek: "SEX",
    dayTitle: "SEXTA-FEIRA, 18 SET",
    load: 8,
    consultas: 3,
    exames: 5,
    appointments: [
      { time: "08:00", patient: "Gilberto Mendes", type: "EXA" },
      { time: "08:45", patient: "Clara Fonseca", type: "CON" },
      { time: "09:30", patient: "Rodrigo Vilela", type: "EXA" },
      { time: "10:15", patient: "Sílvia Marcondes", type: "CON" },
      { time: "11:00", patient: "Pedro Albuquerque", type: "EXA" },
      { time: "11:45", patient: "Gisele Franco", type: "EXA" },
      { time: "14:15", patient: "Daniel Tavares", type: "CON" },
      { time: "15:00", patient: "Flávia Rezende", type: "EXA" },
    ],
  },
  23: {
    day: 23,
    month: "SET",
    dayOfWeek: "QUA",
    dayTitle: "QUARTA-FEIRA, 23 SET",
    load: 10,
    consultas: 4,
    exames: 6,
    appointments: [
      { time: "08:00", patient: "Edison Cavalcanti", type: "EXA" },
      { time: "08:45", patient: "Rosana Pacheco", type: "CON" },
      { time: "09:30", patient: "Fábio Guimarães", type: "EXA" },
      { time: "10:15", patient: "Miriam Barreto", type: "CON" },
      { time: "11:00", patient: "Samuel Dornelles", type: "EXA" },
      { time: "11:45", patient: "Vanessa Rios", type: "CON" },
      { time: "14:00", patient: "Nelson Magalhães", type: "EXA" },
      { time: "14:45", patient: "Cíntia Monteiro", type: "CON" },
      { time: "15:30", patient: "Jorge Benício", type: "EXA" },
      { time: "16:15", patient: "Lilian Prado", type: "EXA" },
    ],
  },
};

// Default fallback generator for unlisted days
function getDaySchedule(day: number, isOutside = false): DaySchedule {
  if (!isOutside && SCHEDULE_DATA[day]) {
    return SCHEDULE_DATA[day];
  }
  const load = isOutside ? (day % 3 === 0 ? 10 : 7) : day % 7 === 0 ? 0 : (day % 4) + 6;
  const consultas = Math.floor(load * 0.4);
  const exames = load - consultas;

  const mockAppts: Appointment[] = [];
  const times = [
    "08:15",
    "09:00",
    "09:45",
    "10:30",
    "11:15",
    "14:00",
    "14:45",
    "15:30",
    "16:15",
    "17:00",
  ];
  const names = [
    "Carlos Eduardo",
    "Fernanda Lima",
    "Roberto Soares",
    "Juliana Paes",
    "Marcos Vinicius",
    "Beatriz Costa",
    "Henrique Toledo",
    "Patrícia Nunes",
    "Ricardo Vasconcelos",
    "Camila Martins",
  ];

  for (let i = 0; i < Math.min(load, 7); i++) {
    mockAppts.push({
      time: times[i] || "08:00",
      patient: names[i] || "Paciente Agendado",
      type: i % 2 === 0 ? "EXA" : "CON",
    });
  }

  return {
    day,
    month: isOutside ? (day > 20 ? "AGO" : "OUT") : "SET",
    isOutside,
    dayOfWeek: "DIA",
    dayTitle: isOutside ? `DIA ${day}` : `DIA ${day}, SETEMBRO`,
    load,
    consultas,
    exames,
    appointments: mockAppts,
  };
}

// 42 cells grid matching image layout exactly
interface GridCell {
  id: string;
  dayNum: number;
  displayNum: string;
  load: number | null;
  isOutside?: boolean;
  isSunday?: boolean;
  colIndex: number;
  rowIndex: number;
}

const CALENDAR_GRID: GridCell[] = [
  // Row 1
  { id: "d-31", dayNum: 31, displayNum: "31", load: 10, isOutside: true, colIndex: 0, rowIndex: 0 },
  { id: "d-01", dayNum: 1, displayNum: "01", load: 6, colIndex: 1, rowIndex: 0 },
  { id: "d-02", dayNum: 2, displayNum: "02", load: 5, colIndex: 2, rowIndex: 0 },
  { id: "d-03", dayNum: 3, displayNum: "03", load: 10, colIndex: 3, rowIndex: 0 },
  { id: "d-04", dayNum: 4, displayNum: "04", load: 9, colIndex: 4, rowIndex: 0 },
  { id: "d-05", dayNum: 5, displayNum: "05", load: 3, colIndex: 5, rowIndex: 0 },
  { id: "d-06", dayNum: 6, displayNum: "06", load: null, isSunday: true, colIndex: 6, rowIndex: 0 },

  // Row 2
  { id: "d-07", dayNum: 7, displayNum: "07", load: 6, colIndex: 0, rowIndex: 1 },
  { id: "d-08", dayNum: 8, displayNum: "08", load: 7, colIndex: 1, rowIndex: 1 },
  { id: "d-09", dayNum: 9, displayNum: "09", load: 8, colIndex: 2, rowIndex: 1 },
  { id: "d-10", dayNum: 10, displayNum: "10", load: 10, colIndex: 3, rowIndex: 1 },
  { id: "d-11", dayNum: 11, displayNum: "11", load: 9, colIndex: 4, rowIndex: 1 },
  { id: "d-12", dayNum: 12, displayNum: "12", load: 3, colIndex: 5, rowIndex: 1 },
  {
    id: "d-13",
    dayNum: 13,
    displayNum: "13",
    load: null,
    isSunday: true,
    colIndex: 6,
    rowIndex: 1,
  },

  // Row 3
  { id: "d-14", dayNum: 14, displayNum: "14", load: 8, colIndex: 0, rowIndex: 2 },
  { id: "d-15", dayNum: 15, displayNum: "15", load: 7, colIndex: 1, rowIndex: 2 },
  { id: "d-16", dayNum: 16, displayNum: "16", load: 6, colIndex: 2, rowIndex: 2 },
  { id: "d-17", dayNum: 17, displayNum: "17", load: 5, colIndex: 3, rowIndex: 2 },
  { id: "d-18", dayNum: 18, displayNum: "18", load: 8, colIndex: 4, rowIndex: 2 },
  { id: "d-19", dayNum: 19, displayNum: "19", load: 5, colIndex: 5, rowIndex: 2 },
  {
    id: "d-20",
    dayNum: 20,
    displayNum: "20",
    load: null,
    isSunday: true,
    colIndex: 6,
    rowIndex: 2,
  },

  // Row 4
  { id: "d-21", dayNum: 21, displayNum: "21", load: 6, colIndex: 0, rowIndex: 3 },
  { id: "d-22", dayNum: 22, displayNum: "22", load: 9, colIndex: 1, rowIndex: 3 },
  { id: "d-23", dayNum: 23, displayNum: "23", load: 10, colIndex: 2, rowIndex: 3 },
  { id: "d-24", dayNum: 24, displayNum: "24", load: 7, colIndex: 3, rowIndex: 3 },
  { id: "d-25", dayNum: 25, displayNum: "25", load: 8, colIndex: 4, rowIndex: 3 },
  { id: "d-26", dayNum: 26, displayNum: "26", load: 3, colIndex: 5, rowIndex: 3 },
  {
    id: "d-27",
    dayNum: 27,
    displayNum: "27",
    load: null,
    isSunday: true,
    colIndex: 6,
    rowIndex: 3,
  },

  // Row 5
  { id: "d-28", dayNum: 28, displayNum: "28", load: 9, colIndex: 0, rowIndex: 4 },
  { id: "d-29", dayNum: 29, displayNum: "29", load: 10, colIndex: 1, rowIndex: 4 },
  { id: "d-30", dayNum: 30, displayNum: "30", load: 10, colIndex: 2, rowIndex: 4 },
  { id: "d-01b", dayNum: 1, displayNum: "01", load: 10, isOutside: true, colIndex: 3, rowIndex: 4 },
  { id: "d-02b", dayNum: 2, displayNum: "02", load: 7, isOutside: true, colIndex: 4, rowIndex: 4 },
  { id: "d-03b", dayNum: 3, displayNum: "03", load: 4, isOutside: true, colIndex: 5, rowIndex: 4 },
  {
    id: "d-04b",
    dayNum: 4,
    displayNum: "04",
    load: null,
    isOutside: true,
    isSunday: true,
    colIndex: 6,
    rowIndex: 4,
  },

  // Row 6
  { id: "d-05b", dayNum: 5, displayNum: "05", load: 8, isOutside: true, colIndex: 0, rowIndex: 5 },
  { id: "d-06b", dayNum: 6, displayNum: "06", load: 5, isOutside: true, colIndex: 1, rowIndex: 5 },
  { id: "d-07b", dayNum: 7, displayNum: "07", load: 10, isOutside: true, colIndex: 2, rowIndex: 5 },
  { id: "d-08b", dayNum: 8, displayNum: "08", load: 7, isOutside: true, colIndex: 3, rowIndex: 5 },
  { id: "d-09b", dayNum: 9, displayNum: "09", load: 6, isOutside: true, colIndex: 4, rowIndex: 5 },
  { id: "d-10b", dayNum: 10, displayNum: "10", load: 4, isOutside: true, colIndex: 5, rowIndex: 5 },
  {
    id: "d-11b",
    dayNum: 11,
    displayNum: "11",
    load: null,
    isOutside: true,
    isSunday: true,
    colIndex: 6,
    rowIndex: 5,
  },
];

export function HomeMotionMonthAgenda({
  defaultExpanded = true,
  onExpandChange,
}: {
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}) {
  // Motion State Engine
  const [isOpen, setIsOpen] = useState<boolean>(defaultExpanded);
  const [motionPhase, setMotionPhase] = useState<"opening" | "hovering" | "today" | "idle">(
    "hovering",
  );
  const [selectedDay, setSelectedDay] = useState<number>(3);
  const [isClickingButton, setIsClickingButton] = useState<boolean>(false);
  const [isClickingToday, setIsClickingToday] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  // Simulated Mouse Pointer Coordinates & target highlight
  const [cursorPos, setCursorPos] = useState<{
    x: number;
    y: number;
    label: string;
    activeTarget: string;
    visible: boolean;
  }>({
    x: 48,
    y: 35,
    label: "Hover: 03 SET (10 Atend.)",
    activeTarget: "d-03",
    visible: true,
  });

  const timelineRef = useRef<NodeJS.Timeout[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimelines = () => {
    timelineRef.current.forEach(clearTimeout);
    timelineRef.current = [];
  };

  // Notify parent on expand change
  useEffect(() => {
    onExpandChange?.(isOpen);
  }, [isOpen, onExpandChange]);

  // Start complete choreography loop
  const startChoreography = (startFromBeginning = false) => {
    clearTimelines();

    if (!isAutoPlaying) return;

    if (startFromBeginning) {
      // Phase 1: Start Closed, Glide to "Abrir Agenda", Click, then Open
      setIsOpen(false);
      setMotionPhase("opening");
      setCursorPos({
        x: 50,
        y: 85,
        label: "Movendo até: Abrir Visão do Mês",
        activeTarget: "btn-open-preview",
        visible: true,
      });

      // 1. Move to button and prepare click
      const t1 = setTimeout(() => {
        setCursorPos({
          x: 50,
          y: 65,
          label: "Clicando em: Abrir Visão do Mês",
          activeTarget: "btn-open-preview",
          visible: true,
        });
        setIsClickingButton(true);
      }, 1000);

      // 2. Click down ripple and open agenda
      const t2 = setTimeout(() => {
        setIsClickingButton(false);
        setIsOpen(true);
        setMotionPhase("hovering");
      }, 1700);

      timelineRef.current.push(t1, t2);
    }

    // Phase 2: Once open, Glide through days in looping!
    const baseDelay = startFromBeginning ? 2400 : 400;

    const hoverSteps = [
      // Day 01
      {
        delay: baseDelay + 400,
        action: () => {
          setMotionPhase("hovering");
          setSelectedDay(1);
          setCursorPos({
            x: 21,
            y: 28,
            label: "Hover: 01 SET (6 Atend.)",
            activeTarget: "d-01",
            visible: true,
          });
        },
      },
      // Day 02
      {
        delay: baseDelay + 2000,
        action: () => {
          setSelectedDay(2);
          setCursorPos({
            x: 34,
            y: 28,
            label: "Hover: 02 SET (5 Atend.)",
            activeTarget: "d-02",
            visible: true,
          });
        },
      },
      // Day 03 (Image Highlight!)
      {
        delay: baseDelay + 3600,
        action: () => {
          setSelectedDay(3);
          setCursorPos({
            x: 47,
            y: 28,
            label: "Hover: 03 SET (10 Atend. - 4 Cons, 6 Exam)",
            activeTarget: "d-03",
            visible: true,
          });
        },
      },
      // Day 04
      {
        delay: baseDelay + 5400,
        action: () => {
          setSelectedDay(4);
          setCursorPos({
            x: 60,
            y: 28,
            label: "Hover: 04 SET (9 Atend.)",
            activeTarget: "d-04",
            visible: true,
          });
        },
      },
      // Day 08
      {
        delay: baseDelay + 7200,
        action: () => {
          setSelectedDay(8);
          setCursorPos({
            x: 21,
            y: 40,
            label: "Hover: 08 SET (7 Atend.)",
            activeTarget: "d-08",
            visible: true,
          });
        },
      },
      // Day 10
      {
        delay: baseDelay + 9000,
        action: () => {
          setSelectedDay(10);
          setCursorPos({
            x: 47,
            y: 40,
            label: "Hover: 10 SET (10 Atend.)",
            activeTarget: "d-10",
            visible: true,
          });
        },
      },
      // Day 18
      {
        delay: baseDelay + 10800,
        action: () => {
          setSelectedDay(18);
          setCursorPos({
            x: 60,
            y: 52,
            label: "Hover: 18 SET (8 Atend.)",
            activeTarget: "d-18",
            visible: true,
          });
        },
      },
      // Day 23
      {
        delay: baseDelay + 12600,
        action: () => {
          setSelectedDay(23);
          setCursorPos({
            x: 34,
            y: 64,
            label: "Hover: 23 SET (10 Atend.)",
            activeTarget: "d-23",
            visible: true,
          });
        },
      },
      // Clica em "IR PARA HOJE"
      {
        delay: baseDelay + 14400,
        action: () => {
          setMotionPhase("today");
          setCursorPos({
            x: 88,
            y: 92,
            label: "Clique: Ir para Hoje (Dia 03)",
            activeTarget: "btn-today",
            visible: true,
          });
          setIsClickingToday(true);
        },
      },
      // Retorna para o Dia 03 (Hoje)
      {
        delay: baseDelay + 15200,
        action: () => {
          setIsClickingToday(false);
          setSelectedDay(3);
          setCursorPos({
            x: 47,
            y: 28,
            label: "Hoje Selecionado: 03 SET",
            activeTarget: "d-03",
            visible: true,
          });
        },
      },
      // Reinicia o ciclo de hover nos dias suavemente em looping contínuo
      {
        delay: baseDelay + 17500,
        action: () => {
          startChoreography(false);
        },
      },
    ];

    hoverSteps.forEach(({ delay, action }) => {
      const t = setTimeout(action, delay);
      timelineRef.current.push(t);
    });
  };

  useEffect(() => {
    if (isAutoPlaying) {
      startChoreography(false);
    } else {
      clearTimelines();
    }
    return () => clearTimelines();
  }, [isAutoPlaying]);

  // Handle manual interaction from human user
  const handleManualDayHover = (day: number, id: string) => {
    setIsAutoPlaying(false);
    clearTimelines();
    setSelectedDay(day);
    setCursorPos({
      x: 0,
      y: 0,
      activeTarget: id,
      label: `Dia ${day} Selecionado`,
      visible: false,
    });
  };

  const handleManualTodayClick = () => {
    clearTimelines();
    setSelectedDay(3);
    setIsClickingToday(true);
    setTimeout(() => setIsClickingToday(false), 300);
  };

  const handleManualToggleOpen = () => {
    clearTimelines();
    setIsClickingButton(true);
    setTimeout(() => {
      setIsClickingButton(false);
      setIsOpen((prev) => !prev);
    }, 200);
  };

  const currentSchedule = getDaySchedule(selectedDay);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-md transition-all duration-500 dark:border-[#3a3528] dark:bg-[#1f1b14]",
        isOpen ? "p-4 sm:p-6 lg:p-7" : "p-5 sm:p-6",
      )}
    >
      {/* Top Interactive Banner / Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DCBA]/60 pb-3 dark:border-[#3a3528]">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8E3E1E] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#8E3E1E]" />
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8E3E1E] dark:text-[#d97750]">
            Motion Design: Agenda Mensal & Hover em Looping
          </span>
          <span className="rounded-full bg-[#B4691B]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#B4691B] dark:bg-[#B4691B]/20 dark:text-[#d48c3b]">
            {isOpen ? "Visão 30 Dias Aberta" : "Clique para Abrir"}
          </span>
        </div>

        {/* Live Controller Buttons */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold transition-all shadow-2xs active:scale-95 cursor-pointer",
              isAutoPlaying
                ? "bg-[#8E3E1E] text-white"
                : "border border-[#E5DCBA] bg-white text-[#6B5A4E] dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#baa998]",
            )}
            title={isAutoPlaying ? "Pausar Navegação Automática" : "Retomar Looping Automático"}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="size-3" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="size-3" />
                <span>Play Looping</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoPlaying(true);
              startChoreography(true);
            }}
            className="flex items-center gap-1.5 rounded-full border border-[#E5DCBA] bg-[#FBF7F0] px-2.5 py-1 font-bold text-[#8E3E1E] hover:bg-[#F3ECE0] transition-colors shadow-2xs cursor-pointer dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#d97750]"
            title="Simular o clique que abre a agenda e inicia a navegação"
          >
            <Sparkles className="size-3 text-[#B4691B]" />
            <span>Simular Abertura</span>
          </button>

          <button
            type="button"
            onClick={handleManualToggleOpen}
            className="hidden sm:flex items-center gap-1 rounded-full border border-[#E5DCBA] bg-white px-2.5 py-1 text-[#6B5A4E] hover:text-[#2C2018] transition-colors shadow-2xs cursor-pointer dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#baa998]"
            title={isOpen ? "Recolher Visão" : "Expandir Visão"}
          >
            {isOpen ? <span>Recolher</span> : <span>Expandir</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative mt-4">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(#dbc1b8_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-10" />

        {/* ========================================================================= */}
        {/* SIMULATED MOUSE CURSOR GLIDING ACROSS DAYS IN LOOPING                     */}
        {/* ========================================================================= */}
        {isAutoPlaying && cursorPos.visible && (
          <div
            className="pointer-events-none absolute z-50 transition-all duration-700 ease-out hidden sm:flex items-center gap-2"
            style={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              transform: "translate(-6px, -6px)",
            }}
          >
            {/* Authentic Mouse Pointer SVG */}
            <div className="relative anim-cursor-glide drop-shadow-md">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-transform duration-200",
                  isClickingButton || isClickingToday ? "scale-90" : "scale-100",
                )}
              >
                <path
                  d="M5.5 3.5L18.5 10.5L12 12.5L9.5 19L5.5 3.5Z"
                  fill="#241E1A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Click Ripple Effect */}
              {(isClickingButton || isClickingToday) && (
                <span className="absolute -top-1 -left-1 size-8 rounded-full border-2 border-[#8E3E1E] bg-[#8E3E1E]/30 animate-ping pointer-events-none" />
              )}
            </div>

            {/* Context Tooltip Pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#E5DCBA] bg-[#241E1A] px-2.5 py-0.5 text-[10px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
              <span className="size-1.5 rounded-full bg-[#B4691B] animate-pulse" />
              <span>{cursorPos.label}</span>
            </div>
          </div>
        )}

        {!isOpen ? (
          /* ========================================================================= */
          /* COMPACT CLOSED STATE (Awaiting Click to Open)                             */
          /* ========================================================================= */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5DCBA] bg-[#FBF7F0]/80 p-8 text-center dark:border-[#3a3528] dark:bg-[#19150f]/80">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#8E3E1E]/10 text-[#8E3E1E] shadow-xs dark:bg-[#8E3E1E]/20 dark:text-[#d97750]">
              <Calendar className="size-7" />
            </div>

            <h4 className="mt-4 font-sans text-xl font-bold tracking-tight text-[#2C2018] dark:text-[#f3ede1]">
              Visão Mensal Estruturada de Atendimentos
            </h4>
            <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#6B5A4E] dark:text-[#baa998]">
              Navegue por todos os 30 dias com visualização instantânea de cargas clínicas, exames e
              consultas.
            </p>

            <button
              type="button"
              id="btn-open-preview"
              onClick={handleManualToggleOpen}
              className={cn(
                "relative mt-6 flex items-center gap-2 rounded-xl px-5 py-3 font-mono text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer active:scale-95",
                isClickingButton
                  ? "bg-[#743116] scale-95 ring-4 ring-[#8E3E1E]/30"
                  : "bg-[#B45309] hover:bg-[#92400e]",
              )}
            >
              <Calendar className="size-4" />
              <span>CLIQUE PARA ABRIR A AGENDA DO MÊS</span>
              {isClickingButton && (
                <span className="absolute inset-0 rounded-xl bg-white/40 animate-ping pointer-events-none" />
              )}
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* FULL OPEN STATE: FAITHFUL REPLICA OF agenda.png WITH REALTIME HOVER       */
          /* ========================================================================= */
          <div className="relative rounded-2xl border border-[#E5DCBA] bg-[#FFFFFF] shadow-xs dark:border-[#3a3528] dark:bg-[#1f1b14]">
            {/* Top Month Header: < SETEMBRO 2026 > */}
            <div className="flex items-center justify-between border-b border-[#E5DCBA]/60 px-4 py-3 sm:px-6 dark:border-[#3a3528]">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-[#E5DCBA] bg-[#FBF7F0] text-[#6B5A4E] hover:bg-[#F3ECE0] hover:text-[#2C2018] transition-colors dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#baa998]"
                title="Mês Anterior"
              >
                <ChevronLeft className="size-4 stroke-[2.5]" />
              </button>

              <div className="text-center">
                <h3 className="font-mono text-sm sm:text-base font-black tracking-widest text-[#2C2018] dark:text-[#f3ede1]">
                  SETEMBRO 2026
                </h3>
              </div>

              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg border border-[#E5DCBA] bg-[#FBF7F0] text-[#6B5A4E] hover:bg-[#F3ECE0] hover:text-[#2C2018] transition-colors dark:border-[#3a3528] dark:bg-[#252018] dark:text-[#baa998]"
                title="Próximo Mês"
              >
                <ChevronRight className="size-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Body: Two Columns on Desktop, Stacked on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E5DCBA] dark:divide-[#3a3528]">
              {/* ========================================================================= */}
              {/* LEFT COLUMN: MONTHLY CALENDAR GRID (7 COLUMNS X 6 ROWS)                   */}
              {/* ========================================================================= */}
              <div className="p-3 sm:p-5 lg:col-span-7">
                {/* Day of week headers */}
                <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-1.5 text-center font-mono text-[10px] sm:text-[11px] font-bold text-[#968374] dark:text-[#a89a8d]">
                  <div className="py-1">SEG</div>
                  <div className="py-1">TER</div>
                  <div className="py-1">QUA</div>
                  <div className="py-1 font-black text-[#8E3E1E] dark:text-[#d97750]">QUI</div>
                  <div className="py-1">SEX</div>
                  <div className="py-1">SÁB</div>
                  <div className="py-1 text-[#B4691B]">DOM</div>
                </div>

                {/* 42 Calendar Cells */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {CALENDAR_GRID.map((cell) => {
                    const isSelected = !cell.isOutside && cell.dayNum === selectedDay;
                    const isSundayBox = cell.isSunday && cell.dayNum === 6 && !cell.isOutside;

                    // Underline load color
                    let barColorClass = "bg-[#E5DCBA] dark:bg-[#4a4233]";
                    if (cell.load !== null) {
                      if (cell.load >= 6) {
                        barColorClass = "bg-[#8E3E1E] dark:bg-[#c96238]"; // 6+ (dark terracotta)
                      } else if (cell.load >= 3) {
                        barColorClass = "bg-[#B4691B] dark:bg-[#e49b50]"; // 3-5 (medium terracotta)
                      } else {
                        barColorClass = "bg-[#EED7C5] dark:bg-[#5c493a]"; // 1-2 (light)
                      }
                    }

                    return (
                      <div
                        key={cell.id}
                        id={cell.id}
                        onMouseEnter={() => handleManualDayHover(cell.dayNum, cell.id)}
                        onClick={() => handleManualDayHover(cell.dayNum, cell.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-between rounded-lg sm:rounded-xl p-1 sm:py-2 transition-all duration-200 cursor-pointer select-none",
                          // Active / Hover styles matching image
                          isSelected
                            ? "bg-[#241E1A] text-white shadow-md ring-2 ring-[#8E3E1E]/40 anim-day-pop z-10 scale-[1.03]"
                            : isSundayBox
                              ? "border border-[#B4691B] bg-transparent text-[#B4691B] hover:bg-[#B4691B]/10"
                              : cell.isOutside
                                ? "opacity-45 hover:opacity-80 bg-white/40 dark:bg-[#1a1712]/40"
                                : "hover:bg-[#F3ECE0] dark:hover:bg-[#252018] bg-[#FAF6EE]/50 dark:bg-[#1c1812]/50 text-[#2C2018] dark:text-[#f3ede1]",
                        )}
                      >
                        {/* Day Number */}
                        <span
                          className={cn(
                            "font-mono text-xs sm:text-sm font-bold",
                            isSelected
                              ? "text-[#FFFDF9]"
                              : isSundayBox
                                ? "text-[#B4691B]"
                                : cell.isOutside
                                  ? "text-[#A89A8D]"
                                  : "text-[#2C2018] dark:text-[#f3ede1]",
                          )}
                        >
                          {cell.displayNum}
                        </span>

                        {/* Load number underneath */}
                        <span
                          className={cn(
                            "font-mono text-[10px] sm:text-[11px] font-semibold mt-0.5",
                            isSelected
                              ? "text-[#E5DCBA]"
                              : cell.isOutside
                                ? "text-[#A89A8D]"
                                : "text-[#6B5A4E] dark:text-[#baa998]",
                          )}
                        >
                          {cell.load !== null ? cell.load : "—"}
                        </span>

                        {/* Load Bar Underneath */}
                        {cell.load !== null && (
                          <div
                            className={cn(
                              "mt-1 h-1 w-5 sm:w-6 rounded-full transition-all",
                              isSelected ? "bg-[#B4691B]" : barColorClass,
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* CARGA Legend at bottom */}
                <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 border-t border-[#E5DCBA]/60 pt-3 font-mono text-[11px] text-[#6B5A4E] dark:border-[#3a3528] dark:text-[#baa998]">
                  <span className="font-bold uppercase tracking-wider text-[#2C2018] dark:text-[#f3ede1]">
                    CARGA
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="h-1 w-4 rounded-full bg-[#EED7C5] dark:bg-[#5c493a]" />
                    <span>1-2</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-1 w-4 rounded-full bg-[#B4691B] dark:bg-[#e49b50]" />
                    <span>3-5</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-1 w-4 rounded-full bg-[#8E3E1E] dark:bg-[#c96238]" />
                    <span className="font-bold text-[#8E3E1E] dark:text-[#d97750]">6+</span>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* RIGHT COLUMN: DAY APPOINTMENTS BREAKDOWN (EXA / CON LIST)                 */}
              {/* ========================================================================= */}
              <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-5 bg-[#FFFDF9] dark:bg-[#1f1b14]">
                <div>
                  {/* Header: QUINTA-FEIRA, 3 SET | 10 ATEND. */}
                  <div className="flex items-center justify-between border-b border-[#E5DCBA]/60 pb-3 dark:border-[#3a3528]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#8E3E1E] animate-pulse" />
                      <h4 className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#2C2018] dark:text-[#f3ede1]">
                        {currentSchedule.dayTitle}
                      </h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#8E3E1E] dark:text-[#d97750]">
                      {currentSchedule.load} ATEND.
                    </span>
                  </div>

                  {/* Appointment List with Scrollable Indicator */}
                  <div className="relative mt-3 max-h-[280px] overflow-y-auto pr-1 space-y-1.5">
                    {currentSchedule.appointments.length > 0 ? (
                      currentSchedule.appointments.map((appt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-[#F7F2E9] dark:hover:bg-[#252018]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] font-bold text-[#B4691B] dark:text-[#d48c3b]">
                              {appt.time}
                            </span>
                            <span className="font-sans font-medium text-[#2C2018] dark:text-[#f3ede1]">
                              {appt.patient}
                            </span>
                          </div>

                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                              appt.type === "EXA"
                                ? "bg-[#FDF2EC] text-[#8E3E1E] dark:bg-[#8E3E1E]/20 dark:text-[#d97750]"
                                : "bg-[#EEF4EE] text-[#3E6748] dark:bg-[#3E6748]/20 dark:text-[#67a074]",
                            )}
                          >
                            {appt.type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-[#968374]">
                        Nenhum atendimento agendado para este dia (Domingo / Folga clínica).
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Summary Stats: 10 TOTAL • 4 CONSULTAS • 6 EXAMES */}
                <div className="mt-4 border-t border-[#E5DCBA]/60 pt-3 dark:border-[#3a3528]">
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-[#2C2018] dark:text-[#f3ede1]">
                      <Calendar className="size-3.5 text-[#8E3E1E] dark:text-[#d97750]" />
                      <div>
                        <span className="font-bold">{currentSchedule.load}</span>
                        <span className="ml-1 text-[10px] text-[#6B5A4E] dark:text-[#baa998]">
                          TOTAL
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#2C2018] dark:text-[#f3ede1]">
                      <Stethoscope className="size-3.5 text-[#3E6748] dark:text-[#67a074]" />
                      <div>
                        <span className="font-bold">{currentSchedule.consultas}</span>
                        <span className="ml-1 text-[10px] text-[#6B5A4E] dark:text-[#baa998]">
                          CONSULTAS
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#2C2018] dark:text-[#f3ede1]">
                      <Users className="size-3.5 text-[#B4691B] dark:text-[#d48c3b]" />
                      <div>
                        <span className="font-bold">{currentSchedule.exames}</span>
                        <span className="ml-1 text-[10px] text-[#6B5A4E] dark:text-[#baa998]">
                          EXAMES
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BOTTOM ACTION BAR: [📅 VISÃO DO MÊS] & [↻ IR PARA HOJE]                   */}
            {/* ========================================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCBA] bg-[#FBF7F0] px-4 py-3 sm:px-6 dark:border-[#3a3528] dark:bg-[#1f1b14]">
              {/* Pill Button: VISÃO DO MÊS */}
              <button
                type="button"
                id="btn-month"
                onClick={handleManualToggleOpen}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-bold text-white shadow-xs transition-all duration-200 cursor-pointer active:scale-95",
                  isClickingButton
                    ? "bg-[#743116] scale-95 ring-2 ring-[#8E3E1E]"
                    : "bg-[#B45309] hover:bg-[#92400e]",
                )}
              >
                <Calendar className="size-4" />
                <span>VISÃO DO MÊS</span>
                {isClickingButton && (
                  <span className="absolute inset-0 rounded-xl bg-white/30 animate-ping pointer-events-none" />
                )}
              </button>

              {/* Right Action: IR PARA HOJE */}
              <button
                type="button"
                id="btn-today"
                onClick={handleManualTodayClick}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-[#8E3E1E] transition-all hover:bg-[#8E3E1E]/10 active:scale-95 cursor-pointer dark:text-[#d97750]",
                  isClickingToday && "scale-95 bg-[#8E3E1E]/20",
                )}
              >
                <RotateCcw className={cn("size-3.5", isClickingToday && "animate-spin")} />
                <span>IR PARA HOJE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
