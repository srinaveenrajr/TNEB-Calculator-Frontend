import React from "react";

/**
 * FROZEN COMPONENT — HTML2Canvas / WhatsApp
 * Do not change DOM structure, class names, borders, or colors below.
 * New columns must preserve: yellow header, black borders, black text, uppercase.
 */
export default function ConsumptionHistoryTableFrozen({ rows }) {
  const list = Array.isArray(rows) ? rows : [];

  return (
    <div className="bg-white p-2 md:p-5 border-4 border-black  h-fit w-full max-w-[850px] mb-5">
      {list.length > 0 && (
        <div className="bg-black text-white p-5 mb-4 flex justify-center gap-4 sm:gap-[100px] items-center border-b-8 border-yellow-400">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">
              Total Units
            </p>
            <h2 className="text-[22px] md:text-4xl font-black">
              {list[0].units.toFixed(2)} <span className="text-sm">kWh</span>
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">
              Current Total Bill
            </p>
            <h2 className="text-[22px] md:text-4xl font-black text-yellow-400">
              ₹{list[0].billAmount.toFixed(2)}
            </h2>
          </div>
        </div>
      )}
      <div className="flex w-full items-center justify-center overflow-x-auto">
        <table className=" text-[9px] md:text-[15px] w-full border-collapse border-4 border-black text-xs font-bold text-center uppercase">
          <thead className="bg-yellow-400 font-black italic">
            <tr>
              <td className=" p-3 md:p-2 border-2 border-black">DATE</td>
              <td className=" p-3 md:p-2 border-2 border-black">READ</td>
              <td className=" p-3 md:p-2 border-2 border-black">BASE LMR</td>
              <td className=" p-3 md:p-2 border-2 border-black">UNIT</td>
              <td className=" p-3 md:p-2 border-2 border-black">BILL</td>
            </tr>
          </thead>
          <tbody>
            {list.map((r, i) => (
              <tr
                key={r._id ?? i}
                className={`border-b-2 border-black h-10 ${i === 0 ? "bg-blue-50" : "bg-white"}`}
              >
                <td className=" text-[10px]  border-r-2 border-black text-black">
                  {r.date}
                </td>
                <td className="border-r-2 border-black text-black">
                  {r.reading}
                </td>
                <td className="border-r-2 border-black text-black">
                  {r.baseLMR}
                </td>
                <td className="border-r-2 border-black text-black">
                  {r.units.toFixed(2)}
                </td>
                <td className="text-blue-700">
                  ₹{Number(r.billAmount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
