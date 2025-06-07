import React from 'react';
import { FeedbackType } from '../../hooks/useFeedback'; // Assuming path, adjust if necessary

interface FeedbackBannerProps {
  message: string;
  type: FeedbackType;
  onClose?: () => void; // Optional: for manually dismissible banners
}

/**
 * FeedbackBanner is a component dedicated to displaying feedback messages (success, error, info, etc.)
 * in an accessible way using ARIA live regions.
 *
 * It uses role="status" for polite announcements, meaning screen readers will announce the message
 * when they are idle, without interrupting the user's current task.
 * For critical errors that need immediate attention, role="alert" might be considered,
 * but "status" is generally appropriate for non-modal feedback.
 */
const FeedbackBanner: React.FC<FeedbackBannerProps> = ({ message, type, onClose }) => {
  if (!message) {
    return null;
  }

  // Determine background and text colors based on feedback type
  // These are example Tailwind CSS classes. Adjust as per your project's styling.
  let bgColor = 'bg-blue-500'; // Default for info
  let textColor = 'text-white';
  let borderColor = 'border-blue-700';

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      borderColor = 'border-green-700';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      borderColor = 'border-red-700';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-black'; // Yellow often needs darker text for contrast
      borderColor = 'border-yellow-700';
      break;
    case 'loading':
      bgColor = 'bg-gray-500';
      borderColor = 'border-gray-700';
      break;
    case 'info':
    default:
      // Already set
      break;
  }

  return (
    <div
      className={`p-4 rounded-md border ${bgColor} ${textColor} ${borderColor} flex items-center justify-between shadow-lg my-2`}
      // ARIA live region: role="status" makes announcements polite.
      // Screen readers will announce changes when they are idle.
      role="status"
      // aria-live="polite" is implicit with role="status"
      // aria-atomic="true" can be added if the entire content should always be announced as a whole,
      // which is usually good for status messages.
      aria-atomic="true"
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white`}
          aria-label="Dismiss feedback"
        >
          {/* Simple 'X' icon for close. Replace with an SVG icon if available. */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default FeedbackBanner;
