import { PageHeading } from '../components/PageHeading';

export function HomePage({ title, description }) {
  return (
    <>
      <PageHeading title={title} description={description} />
    </>
  );
}