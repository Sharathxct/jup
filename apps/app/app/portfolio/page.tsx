'use client';

import { useState } from 'react';
import { Search, Copy, ArrowDownToLine, Bell, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState('Wallets');
  const [showArchived, setShowArchived] = useState(false);
  const pathname = usePathname();

  return (
    <div className="h-[calc(100vh-52px)] bg-black">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-3 bg-[#111827] border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <span className="text-white">Blaze Main</span>
            <span className="text-gray-400">0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search by name or address"
                className="w-full bg-[#1F2937] text-white py-2 px-4 rounded pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <label className="flex items-center gap-2 text-gray-400">
              <input type="checkbox" className="form-checkbox" />
              Show Archived
            </label>
            <button className="bg-[#1F2937] text-gray-400 py-2 px-4 rounded">Import</button>
            <button className="bg-blue-600 text-white py-2 px-4 rounded">Create Wallet</button>
            <button className="bg-[#1F2937] text-gray-400 py-2 px-4 rounded">Source wallets</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="bg-[#1F2937] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#374151]">
                    <th className="text-left text-gray-400 py-3 px-4">Wallet</th>
                    <th className="text-left text-gray-400 py-3 px-4">Balance</th>
                    <th className="text-left text-gray-400 py-3 px-4">Holdings</th>
                    <th className="text-left text-gray-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                          AX
                        </div>
                        <div>
                          <div className="text-white">Blaze Main</div>
                          <div className="text-gray-400 text-sm">9n6b...Fn5k</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white">0</td>
                    <td className="py-4 px-4 text-white">0</td>
                    <td className="py-4 px-4">
                      <button className="text-gray-400 hover:text-white">...</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <div className="text-gray-400 mb-4">Destination</div>
              <div className="bg-[#1F2937] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#374151]">
                      <th className="text-left text-gray-400 py-3 px-4">Wallet</th>
                      <th className="text-left text-gray-400 py-3 px-4">Balance</th>
                      <th className="text-left text-gray-400 py-3 px-4">Holdings</th>
                      <th className="text-left text-gray-400 py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button className="bg-blue-600 text-white py-2 px-4 rounded">Start Transfer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}