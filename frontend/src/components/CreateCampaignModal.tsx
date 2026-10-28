import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Campaign } from '../types';
import { CATEGORIES } from '../config/categories';
import { X, Check, AlertCircle, ImagePlus } from 'lucide-react';
import { uploadMedia } from '../lib/storage';
import { toIsoDate } from '../lib/utils';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided the modal opens in edit mode, pre-filled with the campaign's data */
  initialCampaign?: Campaign;
}

export const TARGET_PLATFORMS = [
  'Instagram Reels',
  'Instagram Stories',
  'Instagram Posts',
  'YouTube Videos',
  'YouTube Shorts',
  'Facebook',
  'X (Twitter)',
  'LinkedIn',
  'Snapchat',
  'ShareChat',
  'Moj',
] as const;

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({ isOpen, onClose, initialCampaign }) => {
  const { createCampaign, updateCampaign } = useMarketplace();
  const isEditing = Boolean(initialCampaign);

  const [title, setTitle] = useState(initialCampaign?.title ?? '');
  const [category, setCategory] = useState(initialCampaign?.category ?? CATEGORIES[0].name);
  const [budget, setBudget] = useState(initialCampaign ? String(initialCampaign.budget) : '100');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialCampaign?.platforms?.length ? initialCampaign.platforms : ['Instagram Reels']
  );
  const [deadline, setDeadline] = useState(toIsoDate(initialCampaign?.deadline || initialCampaign?.submissionDeadline) || '');
  const [contentType, setContentType] = useState(initialCampaign?.contentType ?? '1x 60s Reel + 2x Stories');
  const [description, setDescription] = useState(initialCampaign?.description ?? '');
  const [requirements, setRequirements] = useState(initialCampaign?.requirements ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialCampaign?.imageUrl || '');

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const togglePlatform = (p: string) => {
    setError('');
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedBudget = parseFloat(budget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      setError('Please enter a valid positive budget amount in ₹.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one target platform for your campaign.');
      return;
    }

    if (!deadline) {
      setError('Please select a submission deadline.');
      return;
    }

    if (deadline < todayStr) {
      setError('Submission deadline cannot be in the past. Please select today or a future date.');
      return;
    }

    const isoDeadline = toIsoDate(deadline) || deadline;

    setIsSubmitting(true);
    try {
      let imageUrl = initialCampaign?.imageUrl || '';
      if (imageFile) {
        imageUrl = await uploadMedia(imageFile, 'campaigns');
      }

      if (isEditing && initialCampaign) {
        await updateCampaign(initialCampaign.id, {
          title: title.trim(),
          category,
          budget: parsedBudget,
          platforms: selectedPlatforms,
          platform: selectedPlatforms.join(', '),
          deadline: isoDeadline || initialCampaign.deadline,
          contentType: contentType.trim(),
          description: description.trim(),
          requirements: requirements.trim() || undefined,
          imageUrl,
        });
      } else {
        await createCampaign({
          title: title.trim(),
          category,
          budget: parsedBudget,
          platforms: selectedPlatforms,
          platform: selectedPlatforms.join(', '),
          deadline: isoDeadline,
          contentType: contentType.trim(),
          description: description.trim(),
          requirements: requirements.trim() || undefined,
          status: 'open',
          imageUrl,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || (isEditing ? 'Failed to save changes. Please try again.' : 'Failed to post campaign. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--modal-overlay)] backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-['Archivo']">
              {isEditing ? 'Edit campaign' : 'Post a brand deal campaign'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isEditing ? 'Update your campaign details below' : 'Your opportunity will be visible to vetted creators across India'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border-primary)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)] text-xs font-semibold flex items-center gap-2 border border-[var(--border-primary)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Row 1: Campaign title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Campaign title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Linen Resort Shirts Showcase"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Row 2: Category and Budget on one row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                Budget per creator (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                  ₹
                </span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="100"
                  required
                  step="any"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Deliverable format and Deadline on the next row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                Deliverable format *
              </label>
              <input
                type="text"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                placeholder="e.g. 1x Reel + 2x Story Slides"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
                Submission deadline *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={todayStr}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>

          {/* Row 4: Target platform multi-select chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Target platform *
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                {selectedPlatforms.length} selected (at least 1 required)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_PLATFORMS.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat);
                return (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => togglePlatform(plat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-2xs font-bold'
                        : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span>{plat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Campaign image
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[var(--border-primary)] bg-[var(--input-bg)] cursor-pointer hover:border-[var(--accent)] transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Campaign preview" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <span className="w-16 h-16 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <ImagePlus className="w-5 h-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {imagePreview ? 'Replace image' : 'Upload a cover image'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Stored permanently. JPG, PNG or WEBP up to 5 MB.</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>

          {/* Row 5: Description & Guidelines */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Campaign description & guidelines *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline what kind of creator vibe you are seeking, key talking points, and visual style..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Row 6: Creator requirements (Optional) */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-primary)]">
              Creator requirements (Optional)
            </label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Minimum 15K Indian followers, clean aesthetic, high engagement rate"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-[var(--border-primary)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Save changes' : 'Publish campaign')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
