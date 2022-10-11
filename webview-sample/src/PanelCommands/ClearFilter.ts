import { CommentsPanel } from "../CommentsPanel";

/**
 * Сброс фильтрации комментариев по пользователям
 *
 */
export function ClearFilter() {
	// снимаем фильтрацию
	CommentsPanel._filter = '';
	// обновить панель
	CommentsPanel.currentPanel?.Refresh();
}