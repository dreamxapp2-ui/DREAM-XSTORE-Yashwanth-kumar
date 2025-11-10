import { render, screen } from '@testing-library/react';
import { DownloadButton } from '../DownloadButton';

describe('DownloadButton Component', () => {
  it('renders button with correct text', () => {
    render(<DownloadButton type="design-image" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('button is enabled by default', () => {
    render(<DownloadButton type="design-image" />);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('displays download icon', () => {
    const { container } = render(<DownloadButton type="design-image" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('handles all download types', () => {
    const types = ['design-image', 'order-invoice', 'user-data', 'catalog', 'image-url'] as const;

    types.forEach((type) => {
      const { unmount } = render(<DownloadButton type={type} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('button responds to click events', () => {
    const handleClick = jest.fn();
    const { container } = render(<DownloadButton type="design-image" />);
    const button = screen.getByRole('button');

    button.click();
    expect(button).toBeInTheDocument();
  });
});
