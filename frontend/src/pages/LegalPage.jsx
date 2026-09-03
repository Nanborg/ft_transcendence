import { PageHeading } from '../components/PageHeading';

function renderMarkdownLine(line, index) {
	if (line.startsWith('## ')) { return <h2 key={index}>{line.slice(3)}</h2>; }
	if (line.startsWith('- ')) { return <li key={index}>{line.slice(2)}</li>; }
	if (line.trim() === '```txt' || line.trim() === '```') { return null; }
	if (!line.trim()) { return null; }
	return <p key={index}>{line}</p>;
}

function renderMarkdown(markdown) {
	const lines = markdown.split('\n').slice(1);
	const elements = [];
	let listItems = [];

	lines.forEach((line, index) => {
		const renderedLine = renderMarkdownLine(line, index);

		if (renderedLine?.type === 'li') {
			listItems.push(renderedLine);
			return;
		}
		if (listItems.length > 0) {
			elements.push(<ul key={`list-${index}`}>{listItems}</ul>);
			listItems = [];
		}
		if (renderedLine) {
			elements.push(renderedLine);
		}
	});

	if (listItems.length > 0) {
		elements.push(<ul key="list-last">{listItems}</ul>);
	}
	return elements;
}

export function LegalPage({ title, description, content }) {
	return (
		<div className="legal-page">
			<PageHeading title={title} description={description} />
			<div className="legal-content">{renderMarkdown(content)}</div>
		</div>
	);
}
