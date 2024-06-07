import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Claiming } from "./Claiming";
import { Liquidity } from "./Liquidity";

export const Board = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<Claiming />} />
          <Route path="liquidity" element={<Liquidity />} />
      </Routes>
    </BrowserRouter>
  );
}