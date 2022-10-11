import { CommentsPanel } from "../CommentsPanel";

/**
 * Установка фильтра комментариев по пользователям
 *
 *  @param author автор комментария
 */
export function Filter(author: string): void {
	// выставляем признак фильтрации
	CommentsPanel._filter = author;
	// обновить панель
	CommentsPanel.currentPanel?.Refresh();
}