import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const shuffle = (array: (typeof squareData)[0][]) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const squareData = [
  {
    id: 1,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/10981975431.jpg?t=2024-11-21T20%3A07%3A13.748Z",
  },
  {
    id: 2,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11111350573.jpg?t=2024-11-21T20%3A07%3A39.301Z",
  },
  {
    id: 3,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11519749812.jpg?t=2024-11-21T20%3A07%3A46.579Z",
  },
  {
    id: 4,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11533562831.jpg?t=2024-11-21T20%3A07%3A57.826Z",
  },
  {
    id: 5,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11840789815.jpg?t=2024-11-21T20%3A08%3A04.590Z",
  },
  {
    id: 6,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11926744830.jpg?t=2024-11-21T20%3A08%3A13.454Z",
  },
  {
    id: 7,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11941148113.jpg?t=2024-11-21T20%3A08%3A19.455Z",
  },
  {
    id: 8,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/11945011763.jpg?t=2024-11-21T20%3A08%3A28.154Z",
  },
  {
    id: 9,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/12027930753.jpg?t=2024-11-21T20%3A08%3A37.181Z",
  },
  {
    id: 10,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/12051083043.jpg?t=2024-11-21T20%3A08%3A44.618Z",
  },
  {
    id: 11,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/12083939859.jpg?t=2024-11-21T20%3A08%3A52.003Z",
  },
  {
    id: 12,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/12106155114.jpg?t=2024-11-21T20%3A09%3A00.224Z",
  },
  {
    id: 13,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/12213985555.jpg",
  },
  {
    id: 14,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/3658449239.jpg?t=2024-11-21T20%3A09%3A14.807Z",
  },
  {
    id: 15,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/5688658841.jpg",
  },
  {
    id: 16,
    src: "https://thttmiedctypjsjwdeil.supabase.co/storage/v1/object/public/assets/Header-Box/8078713183.jpg",
  },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef<any>(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());
    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default ShuffleGrid;