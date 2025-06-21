'use client';

import { useState } from 'react';
import { Search, Copy, ArrowDownToLine } from 'lucide-react';

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState('Wallets');
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      {/* Tabs */}
      <div className="flex items-center gap-8 px-6 pt-6">
        <div className="flex items-center gap-1">
          <button 
            className={`px-1 py-2 text-sm ${selectedTab === 'Spot' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setSelectedTab('Spot')}
          >
            Spot
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className={`px-1 py-2 text-sm ${selectedTab === 'Wallets' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setSelectedTab('Wallets')}
          >
            Wallets
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className={`px-1 py-2 text-sm ${selectedTab === 'Perpetuals' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
            onClick={() => setSelectedTab('Perpetuals')}
          >
            Perpetuals
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-sm">Blaze Main</div>
            <div className="flex items-center gap-1 text-sm text-blue-500">
              0
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or address"
              className="w-full bg-[#111827] text-sm rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="form-checkbox h-4 w-4 rounded bg-[#111827] border-gray-600"
              />
              Show Archived
            </label>
            <button className="px-3 py-1.5 text-sm bg-[#111827] text-gray-400 rounded-lg hover:bg-[#1F2937]">
              Import
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Wallet
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#111827] text-gray-400 rounded-lg hover:bg-[#1F2937]">
              Source wallets
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111827] rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm text-gray-400 border-b border-[#1F2937]">
            <div>Wallet</div>
            <div>Balance</div>
            <div>Holdings</div>
            <div>Actions</div>
          </div>

          {/* Wallet Row */}
          <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm hover:bg-[#1F2937]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                AX
              </div>
              <div>
                <div className="font-medium">Blaze Main</div>
                <div className="flex items-center gap-1 text-gray-400">
                  <span>9n6b...Fn5k</span>
                  <button className="hover:text-gray-300">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span>0</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Add action buttons here */}
            </div>
          </div>

          {/* Drop Zone */}
          <div className="flex flex-col items-center justify-center p-12 border-t border-[#1F2937] text-gray-400">
            <ArrowDownToLine className="w-8 h-8 mb-2" />
            <div className="text-sm">Drag wallets to distribute SOL</div>
          </div>
        </div>

        {/* Destination Section */}
        <div className="mt-6">
          <div className="text-sm text-gray-400 mb-2">Destination</div>
          <div className="bg-[#111827] rounded-lg">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 text-sm text-gray-400 border-b border-[#1F2937]">
              <div>Wallet</div>
              <div>Balance</div>
              <div>Holdings</div>
              <div>Actions</div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Start Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}