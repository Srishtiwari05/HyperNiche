import React from 'react';
import { UserProfile } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { MapPin, Send, ExternalLink } from 'lucide-react';

interface CreatorCardProps {
  creator: UserProfile;
  onSendBrief: (creator: UserProfile) => void;
  onViewProfile?: (creator: UserProfile) => void;
}

const pastelBgList = ['#FFE3D3', '#FFF0B8', '#D9F2E6', '#E6DCFF', '#FFDBE6'];

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onSendBrief, onViewProfile }) => {
  // Hash creator id to pick consistent pastel color
  const colorIndex = Math.abs(creator.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % pastelBgList.length;
  const avatarBg = pastelBgList[colorIndex];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: Avatar + Name + Verification + Niche */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onViewProfile && onViewProfile(creator)}
              style={{ backgroundColor: avatarBg }}
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-[#2B2622] border border-[var(--border-primary)] shrink-0 font-['Archivo'] hover:opacity-90 cursor-pointer transition-opacity"
              title="View profile"
            >
              {creator.name.charAt(0).toUpperCase()}
            </button>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => onViewProfile && onViewProfile(creator)}
                  className="font-bold text-sm text-[var(--text-primary)] tracking-tight font-['Archivo'] hover:text-[var(--accent)] text-left cursor-pointer transition-colors"
                >
                  {creator.name}
                </button>
                <VerificationBadge isVerified={creator.isVerified} size="sm" />
              </div>
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {creator.handle}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--border-primary)] shrink-0">
            {creator.niche || 'General'}
          </span>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
            {creator.bio}
          </p>
        )}

        {/* Badges: Followers, Platform, Content type */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-[var(--input-bg)] p-2 rounded-lg border border-[var(--border-primary)]/60">
            <span className="block text-[10px] font-semibold text-[var(--text-muted)]">
              Audience
            </span>
            <span className="font-bold text-[var(--text-primary)] text-xs">
              {creator.followers || '10K-50K'}
            </span>
          </div>

          <div className="bg-[var(--input-bg)] p-2 rounded-lg border border-[var(--border-primary)]/60">
            <span className="block text-[10px] font-semibold text-[var(--text-muted)]">
              Platform
            </span>
            <span className="font-bold text-[var(--text-primary)] text-xs truncate block">
              {creator.platform || 'Instagram Reels'}
            </span>
          </div>
        </div>

        {/* Deliverable format & Location */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-3 pb-3 border-b border-[var(--border-primary)]/60">
          <span className="truncate pr-2 font-medium">
            Format: {creator.contentType || 'Reel + Story'}
          </span>
          {creator.city && (
            <span className="flex items-center gap-1 shrink-0 text-[var(--text-secondary)]">
              <MapPin className="w-3 h-3 text-[var(--accent)]" />
              <span>{creator.city}</span>
            </span>
          )}
        </div>

        {/* Creator Portfolio Link */}
        {creator.portfolio && (
          <div className="mb-3">
            <a
              href={creator.portfolio.startsWith('http') ? creator.portfolio : `https://${creator.portfolio}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline"
            >
              <span>View Portfolio & Showreel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Footer: Send Collab Invitation button */}
      <div className="pt-2">
        <button
          onClick={() => onSendBrief(creator)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-bold hover:bg-[var(--accent)] hover:text-white transition-all shadow-2xs cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send collab invitation</span>
        </button>
      </div>
    </div>
  );
};
