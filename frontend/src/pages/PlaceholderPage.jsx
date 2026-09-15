// WHY: Placeholder page handles routes that exist before their UI is implemented
// DECISION: Shared heading keeps unfinished screens consistent with completed pages
// FALLBACK: Missing page bodies still render a valid shell
import { PageHeading } from '../components/PageHeading';

export function PlaceholderPage({ title, description })
{
	return (<> <PageHeading title={title} description={description} /> </>);
}
