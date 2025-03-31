// src/tests/services-test.ts
import { GraphService } from '../services/GraphService';
import { ExportImportService } from '../services/ExportImportService';
import { LoggerService } from '../services/LoggerService';
import { CardType } from '../shared/types/card';

// Функция для тестирования GraphService
function testGraphService() {
  console.log('=== Testing GraphService ===');

  const graphService = new GraphService();

  // Тест 1: Добавление карточки
  const card1 = graphService.addCard({
    title: 'Первая реплика',
    text: 'Привет, мир!',
    is_narrator: true,
    position: { x: 100, y: 100 }
  });
  console.log('Added card:', card1);

  // Тест 2: Добавление второй карточки с конкретным ID
  const card2 = graphService.addCard({
    id: 5,
    title: 'Вторая реплика',
    text: 'Как дела?',
    position: { x: 300, y: 100 }
  });
  console.log('Added card with specific ID:', card2);

  // Тест 3: Обновление карточки
  const updatedCard = graphService.updateCard(1, {
    text: 'Обновленный текст',
    is_thought: true
  });
  console.log('Updated card:', updatedCard);

  // Тест 4: Добавление связи
  const edge = graphService.addEdge(1, 5, {
    label: 'Переход',
    type: 'normal',
    color: '#ff0000'
  });
  console.log('Added edge:', edge);

  // Тест 5: Получение всего графа
  const layout = graphService.getLayout();
  console.log('Full graph layout:', layout);

  return graphService;
}

// Функция для тестирования ExportImportService
function testExportImportService(graphService: GraphService) {
  console.log('\n=== Testing ExportImportService ===');

  const exportImportService = new ExportImportService();

  // Тест 1: Экспорт в YAML
  const scene = graphService.getScene();
  const yamlContent = exportImportService.exportToYAML(scene);
  console.log('Exported YAML:');
  console.log(yamlContent);

  // Тест 2: Импорт из YAML
  try {
    const importedScene = exportImportService.importFromYAML(yamlContent);
    console.log('Imported scene from YAML:', importedScene);

    // Проверка корректности импорта
    console.log('Import successful:',
      importedScene.cards.length === scene.cards.length &&
      importedScene.edges.length === scene.edges.length
    );
  } catch (error) {
    console.error('Import error:', error);
  }
}

// Функция для тестирования LoggerService
function testLoggerService() {
  console.log('\n=== Testing LoggerService ===');

  const loggerService = new LoggerService();

  // Тест 1: Логирование ошибки
  try {
    throw new Error('Тестовая ошибка');
  } catch (error) {
    // Исправление: явное приведение к типу Error
    const logEntry = loggerService.logError(error as Error, 'Тестирование логирования');
    console.log('Created log entry:', logEntry);
  }

  // Тест 2: Получение списка логов
  const logs = loggerService.getLogs();
  console.log('All logs:', logs);

  // Тест 3: Получение содержимого файла лога
  if (logs.length > 0) {
    const logContent = loggerService.getLogFileContent(logs[0].id);
    console.log('Log file content:', logContent);
  }
}

// Запуск всех тестов
function runAllTests() {
  console.log('Starting service tests...\n');

  const graphService = testGraphService();
  testExportImportService(graphService);
  testLoggerService();

  console.log('\nAll tests completed.');
}

// Запускаем тесты
runAllTests();
