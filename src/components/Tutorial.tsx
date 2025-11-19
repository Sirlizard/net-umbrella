import introJs from 'intro.js'
import 'intro.js/introjs.css'

// Lightweight wrapper to start an Intro.js guided tour.
// This intentionally avoids React hooks so it can be called from anywhere.
export function startTour() {
  const intro = introJs()

  intro.setOptions({
    showProgress: true,
    exitOnOverlayClick: true,
    nextLabel: 'Next',
    prevLabel: 'Back',
    skipLabel: 'Skip Tour',
    doneLabel: 'Done',
    steps: [
      {
        intro: 'Welcome to Net-umbrella — I\'ll walk you through the main interface.'
      },
      {
        element: document.querySelector('#tutorial-brand') as HTMLElement | null,
        intro: 'This is the app brand and quick access to the main dashboard.'
      },
      {
        element: document.querySelector('#tutorial-tabs') as HTMLElement | null,
        intro: 'Use these tabs to switch between Dashboard, Analytics, and Journal.'
      },
      {
        element: document.querySelector('#help-button') as HTMLElement | null,
        intro: 'Open the help modal here for quick tips and links.'
      },
      {
        element: document.querySelector('#options-menu') as HTMLElement | null,
        intro: 'Open your profile menu here to view profile or sign out.'
      },
      {
        element: document.querySelector('#tutorial-events-link') as HTMLElement | null,
        intro: 'Visit Events to create and manage plans with your connections.'
      },
      {
        intro: 'That\'s the quick tour. Use the Help for more detailed guidance.'
      }
    ]
  })

  intro.start()
}

export default startTour
