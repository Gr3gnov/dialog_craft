// src/services/ExportImportService.ts
import * as yaml from 'js-yaml';
import { DialogScene } from '../shared/types/scene';
import { Card } from '../shared/types/card';
import { Edge } from '../shared/types/edge';

export class ExportImportService {
  // Экспорт сцены в YAML формат
  exportToYAML(scene: DialogScene): string {
    try {
      // Клонируем сцену для преобразования
      const sceneClone = JSON.parse(JSON.stringify(scene));

      // Сортируем карточки по ID перед экспортом, как требуется в ТЗ
      sceneClone.cards.sort((a: Card, b: Card) => a.id - b.id);

      return yaml.dump(sceneClone, {
        indent: 2,
        lineWidth: -1, // Отключаем ограничение длины строки
        noRefs: true   // Избегаем преобразования дублированных объектов в ссылки
      });
    } catch (error) {
      console.error('Ошибка при экспорте в YAML:', error);
      throw new Error(`Не удалось экспортировать в YAML: ${error.message}`);
    }
  }

  // Импорт сцены из YAML формата
  importFromYAML(yamlContent: string): DialogScene {
    try {
      const scene = yaml.load(yamlContent) as DialogScene;

      // Проверка валидности импортируемой сцены
      this.validateScene(scene);

      return scene;
    } catch (error) {
      console.error('Ошибка при импорте из YAML:', error);
      throw new Error(`Не удалось импортировать из YAML: ${error.message}`);
    }
  }

  // Методы для будущего расширения
  exportToJSON(scene: DialogScene): string {
    return JSON.stringify(scene, null, 2);
  }

  importFromJSON(jsonContent: string): DialogScene {
    try {
      const scene = JSON.parse(jsonContent) as DialogScene;
      this.validateScene(scene);
      return scene;
    } catch (error) {
      console.error('Ошибка при импорте из JSON:', error);
      throw new Error(`Не удалось импортировать из JSON: ${error.message}`);
    }
  }

  // Проверка валидности импортируемой сцены
  private validateScene(scene: DialogScene): void {
    // Проверяем наличие обязательных полей
    if (!scene.id || !scene.name || !Array.isArray(scene.cards) || !Array.isArray(scene.edges)) {
      throw new Error('Некорректный формат сцены: отсутствуют обязательные поля');
    }

    // Проверяем наличие обязательных полей в каждой карточке
    scene.cards.forEach(card => {
      if (card.id === undefined || card.type === undefined ||
          card.title === undefined || card.text === undefined ||
          card.position === undefined) {
        throw new Error(`Некорректный формат карточки с ID ${card.id}: отсутствуют обязательные поля`);
      }
    });

    // Проверяем наличие обязательных полей в каждой связи
    scene.edges.forEach(edge => {
      if (edge.id === undefined || edge.source === undefined || edge.target === undefined) {
        throw new Error(`Некорректный формат связи с ID ${edge.id}: отсутствуют обязательные поля`);
      }
    });

    // Проверяем соответствие ID карточек в связях
    const cardIds = new Set(scene.cards.map(card => card.id));
    scene.edges.forEach(edge => {
      if (!cardIds.has(edge.source)) {
        throw new Error(`Связь ${edge.id} ссылается на несуществующую исходную карточку с ID ${edge.source}`);
      }
      if (!cardIds.has(edge.target)) {
        throw new Error(`Связь ${edge.id} ссылается на несуществующую целевую карточку с ID ${edge.target}`);
      }
    });
  }
}
