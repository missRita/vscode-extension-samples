/**
 * Подготвка строки комментария к работе с парсером xml
 *
 *  @param comment кастомный элемент комментария
 */
export function PrepareToParsing(comment: string) : string
{
	const r1 = new RegExp('<\\?','g');
	comment =  comment.replace(r1, '<');
	const r2 = new RegExp('\\?>','g');
	comment =  comment.replace(r2, '>');
	const r3 = new RegExp('oxy_comment_end','g');
	return  comment.replace(r3, '/oxy_comment_start');
}

/**
 * Подготвка строки комментария к публикации
 *
 *  @param xml результат сборки билдера
 */
export function PrepareToPublishing(xml: string) : string|undefined
{
	const simpleCommentRegexp = new RegExp('<oxy_comment_start.*?>.*?<\\/oxy_comment_start>', 'sig');
	// чистим от мусора выходную строку
	let m2 = simpleCommentRegexp.exec(xml);

	if (m2 === null || m2 === undefined) { return undefined; }

	let replaceText = m2[0];

	// возврат структуры элемента
	const r4 = new RegExp('<','g');
	replaceText =  replaceText.replace(r4, '<?');
	const r5 = new RegExp('>','g');
	replaceText =  replaceText.replace(r5, '?>');
	const r6 = new RegExp('/oxy_comment_start','g');
	return replaceText.replace(r6, 'oxy_comment_end');
}