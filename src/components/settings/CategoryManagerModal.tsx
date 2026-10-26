import React, { useState } from 'react';
import { X, Plus, Tag, Trash2, Edit3, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Category, CategoryType } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { categories, addCategory, editCategory, deleteCategory } = useFinance();
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2457E6');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentList = categories.filter(c => c.type === activeType);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await addCategory({
        name: newCatName.trim(),
        type: activeType,
        color: newCatColor,
        icon: 'Tag',
        is_default: false,
      });
      setNewCatName('');
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to add category');
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await editCategory(id, { name: editName.trim() });
    setEditingCatId(null);
  };

  const colors = [
    '#2457E6', '#16845B', '#D64545', '#B7791F', 
    '#4F46E5', '#0891B2', '#7C3AED', '#DB2777', '#737B89'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#161F30] rounded-xl shadow-lg border border-[#E6E9EF] dark:border-[#222C3E] p-5 space-y-4 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E6E9EF] dark:border-[#222C3E] pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#2457E6]" />
            <h2 className="text-[15px] font-semibold text-[#202633] dark:text-[#F3F5F9]">Manage categories</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#737B89] hover:text-[#202633] dark:hover:text-[#F3F5F9]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch between Expense and Income */}
        <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#E6E9EF]/60 dark:bg-[#0E131F] rounded-lg">
          <button
            type="button"
            onClick={() => setActiveType('expense')}
            className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
              activeType === 'expense'
                ? 'bg-white dark:bg-[#161F30] text-[#D64545] shadow-2xs font-semibold'
                : 'text-[#737B89] dark:text-[#8E98A8]'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Expense ({categories.filter(c => c.type === 'expense').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('income')}
            className={`py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center space-x-1 transition-all ${
              activeType === 'income'
                ? 'bg-white dark:bg-[#161F30] text-[#16845B] shadow-2xs font-semibold'
                : 'text-[#737B89] dark:text-[#8E98A8]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Income ({categories.filter(c => c.type === 'income').length})</span>
          </button>
        </div>

        {error && (
          <div className="p-2 rounded-lg bg-[#D64545]/10 border border-[#D64545]/20 text-[#D64545] text-[12px] text-center font-medium">
            {error}
          </div>
        )}

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px] max-h-[220px]">
          {currentList.map(cat => (
            <div
              key={cat.id}
              className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] flex items-center justify-between text-[12px]"
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                {editingCatId === cat.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="px-2 py-0.5 rounded bg-white dark:bg-[#161F30] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="font-normal text-[#202633] dark:text-[#F3F5F9] truncate">
                    {cat.name}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                {editingCatId === cat.id ? (
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    className="px-2 py-0.5 rounded bg-[#2457E6] text-white text-[11px] font-medium"
                  >
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="p-1 text-[#737B89] hover:text-[#2457E6] rounded hover:bg-[#E6E9EF] dark:hover:bg-[#222C3E]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {!cat.is_default && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1 text-[#737B89] hover:text-[#D64545] rounded hover:bg-[#D64545]/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new Category */}
        <form onSubmit={handleAdd} className="space-y-2 pt-2 border-t border-[#E6E9EF] dark:border-[#222C3E]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder={`New ${activeType} category`}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-[#0E131F] border border-[#E6E9EF] dark:border-[#222C3E] text-[12px] text-[#202633] dark:text-[#F3F5F9] focus:outline-none focus:border-[#2457E6]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#2457E6] hover:bg-[#1d46b8] text-white text-[12px] font-medium flex items-center space-x-1 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Color palette picker */}
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-[11px] text-[#737B89] dark:text-[#8E98A8]">Tag color:</span>
            <div className="flex space-x-1.5">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCatColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    newCatColor === c ? 'scale-125 ring-2 ring-offset-1 ring-[#2457E6]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
