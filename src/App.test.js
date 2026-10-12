import { render, screen } from '@testing-library/react';
import { SmartPgLogo, BuildingIcon, BedIcon } from './components/Icons';

test('renders Smart PG brand icon and system icons correctly', () => {
  const { container } = render(
    <div>
      <SmartPgLogo size={32} />
      <BuildingIcon size={20} />
      <BedIcon size={20} />
    </div>
  );
  const svgs = container.querySelectorAll('svg');
  expect(svgs.length).toBe(3);
});

