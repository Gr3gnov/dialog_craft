# Архитектура приложения Dialog Craft

## 1. Общая структура проекта

Для организации кода будем использовать модульную архитектуру с разделением на следующие основные компоненты:

```
dialog-craft/
├── public/                    # Статические ресурсы
├── src/
│   ├── main/                  # Главный процесс Electron
│   │   ├── main.ts            # Точка входа Electron
│   │   ├── ipc-handlers.ts    # Обработчики IPC сообщений
│   │   └── logger.ts          # Логирование ошибок
│   │
│   ├── renderer/              # Процесс рендеринга (фронтенд React)
│   │   ├── App.tsx            # Корневой компонент приложения
│   │   ├── index.tsx          # Точка входа React
│   │   │
│   │   ├── components/        # React компоненты
│   │   │   ├── CardNode/      # Компонент карточки
│   │   │   ├── EdgeConnector/ # Компонент связи
│   │   │   ├── PropertyPanel/ # Панель свойств
│   │   │   ├── Workspace/     # Рабочая область
│   │   │   └── ErrorDialog/   # Окно ошибок
│   │   │
│   │   ├── hooks/             # Пользовательские React хуки
│   │   │
│   │   ├── layouts/           # Шаблоны макетов
│   │   │   └── MainLayout.tsx # Основной макет
│   │   │
│   │   └── contexts/          # React контексты
│   │       └── EditorContext.tsx # Контекст редактора
│   │
│   ├── shared/                # Код, используемый как в main, так и в renderer
│   │   ├── types/             # TypeScript типы и интерфейсы
│   │   ├── constants.ts       # Константы приложения
│   │   └── utils/             # Общие утилиты
│   │
│   ├── services/              # Сервисы приложения
│   │   ├── FileService.ts     # Работа с файлами
│   │   ├── GraphService.ts    # Работа с графом диалогов
│   │   ├── ExportImportService.ts  # Экспорт/импорт в YAML
│   │   └── AutosaveService.ts      # Автосохранение
│   │
│   └── store/                 # Управление состоянием
│       ├── reducers/          # Редьюсеры
│       ├── actions/           # Действия
│       └── index.ts           # Конфигурация хранилища
│
├── package.json               # Зависимости и скрипты
├── tsconfig.json              # Конфигурация TypeScript
└── electron-builder.yml       # Конфигурация сборки приложения
```

## 2. Архитектурные паттерны и принципы

### 2.1. Паттерн Модуль

Разделим функциональность на независимые модули с четко определенными интерфейсами. Это позволит легко заменять или модифицировать отдельные части без влияния на остальное приложение.

### 2.2. Паттерн Наблюдатель (Observer)

Используем React контексты и хуки для реализации паттерна наблюдатель, чтобы компоненты могли реагировать на изменения в данных.

### 2.3. MVC-подобная структура

- **Model**: Сервисы и хранилище данных (store)
- **View**: React компоненты в renderer
- **Controller**: Обработчики событий и действия (actions)

### 2.4. Принципы SOLID

- **Single Responsibility**: Каждый модуль отвечает за одну функциональность
- **Open/Closed**: Расширение функциональности без модификации существующего кода
- **Liskov Substitution**: Взаимозаменяемость компонентов через интерфейсы
- **Interface Segregation**: Узкоспециализированные интерфейсы
- **Dependency Inversion**: Зависимость от абстракций, а не конкретных реализаций

## 3. Ключевые компоненты и их взаимодействие

### 3.1. Основные модули данных

```typescript
// Типы и интерфейсы

interface Card {
  id: number;
  title: string;
  type: CardType;
  text: string;
  background?: string;
  portrait?: string;
  character_name?: string;
  introduce_character?: boolean;
  pause?: number;
  is_narrator: boolean;
  is_thought: boolean;
  position: { x: number; y: number };
  [key: string]: any; // Для дополнительных параметров
}

interface Edge {
  id: string;
  source: number;
  target: number;
  label?: string;
  type?: string;
  color?: string;
}

enum CardType {
  REPLICA = "replica",
}

interface DialogScene {
  id: string;
  name: string;
  cards: Card[];
  edges: Edge[];
}
```

### 3.2. Сервисы

#### 3.2.1. GraphService

Отвечает за управление графом диалогов (добавление, редактирование, удаление карточек и связей).

```typescript
class GraphService {
  addCard(card: Partial<Card>): Card;
  updateCard(id: number, updates: Partial<Card>): Card;
  deleteCard(id: number): void;
  addEdge(source: number, target: number, options?: Partial<Edge>): Edge;
  updateEdge(id: string, updates: Partial<Edge>): Edge;
  deleteEdge(id: string): void;
  getLayout(): { cards: Card[]; edges: Edge[] };
}
```

#### 3.2.2. FileService

Управляет операциями с файлами (сохранение, загрузка, автосохранение).

```typescript
class FileService {
  saveScene(scene: DialogScene, path: string): Promise<void>;
  loadScene(path: string): Promise<DialogScene>;
  performAutosave(scene: DialogScene): Promise<void>;
  getAutosaveFiles(): Promise<string[]>;
  loadAutosave(path: string): Promise<DialogScene>;
}
```

#### 3.2.3. ExportImportService

Отвечает за экспорт и импорт в форматы YAML (с возможностью расширения на другие форматы).

```typescript
class ExportImportService {
  exportToYAML(scene: DialogScene): string;
  importFromYAML(yamlContent: string): DialogScene;
  // Методы для будущего расширения
  exportToJSON(scene: DialogScene): string;
  importFromJSON(jsonContent: string): DialogScene;
}
```

#### 3.2.4. AutosaveService

Управляет автосохранением текущего проекта.

```typescript
class AutosaveService {
  startAutosave(callback: () => DialogScene): void;
  stopAutosave(): void;
  getAutosaves(): Promise<string[]>;
  restoreAutosave(path: string): Promise<DialogScene>;
}
```

### 3.3. Управление состоянием

Используем Redux для центрального управления состоянием приложения.

```typescript
// Основные действия (actions)
enum ActionTypes {
  ADD_CARD,
  UPDATE_CARD,
  DELETE_CARD,
  ADD_EDGE,
  UPDATE_EDGE,
  DELETE_EDGE,
  LOAD_SCENE,
  CLEAR_SCENE,
  SET_SELECTED_CARD,
  SET_SELECTED_EDGE,
}

// Состояние приложения
interface AppState {
  scene: DialogScene;
  selectedCardId: number | null;
  selectedEdgeId: string | null;
  isModified: boolean;
  currentFilePath: string | null;
  errors: string[];
}
```

### 3.4. Коммуникация между процессами Electron

Используем IPC для обмена сообщениями между main и renderer процессами.

```typescript
// Каналы IPC
enum IpcChannels {
  SAVE_FILE,
  OPEN_FILE,
  EXPORT_YAML,
  IMPORT_YAML,
  SHOW_ERROR,
  GET_AUTOSAVES,
  OPEN_AUTOSAVE,
}
```

## 4. Пользовательский интерфейс

### 4.1. Компоненты UI

#### 4.1.1. Workspace

Основная рабочая область с холстом для диаграммы, использующая Cytoscape.js.

#### 4.1.2. CardNode

Компонент карточки с отображением всех параметров и обработкой взаимодействий.

#### 4.1.3. PropertyPanel

Панель для редактирования свойств выбранной карточки или связи.

#### 4.1.4. ErrorDialog

Окно для отображения ошибок с возможностью просмотра деталей.

### 4.2. Интеграция с Cytoscape.js и Dagre

```typescript
class CytoscapeManager {
  initialize(container: HTMLElement): void;
  renderGraph(cards: Card[], edges: Edge[]): void;
  applyLayout(): void;
  onNodeSelected(callback: (id: number) => void): void;
  onEdgeSelected(callback: (id: string) => void): void;
  onNodeMoved(
    callback: (id: number, position: { x: number; y: number }) => void
  ): void;
}
```

## 5. Обработка ошибок и логирование

### 5.1. Система логирования

```typescript
class Logger {
  logError(error: Error): void;
  getErrors(): string[];
  clearErrors(): void;
  deleteError(index: number): void;
}
```

### 5.2. Отображение ошибок пользователю

Реализуем окно с списком ошибок, которое отображает человекочитаемые сообщения и ссылки на полные логи.

## 6. Расширяемость и масштабируемость

### 6.1. Добавление новых параметров карточек

Модульная структура позволяет легко добавлять новые параметры карточек без изменения основной логики.

### 6.2. Добавление новых форматов экспорта/импорта

Сервис ExportImportService спроектирован с учетом будущего расширения на другие форматы.

### 6.3. Оптимизация производительности

Для обработки большого количества карточек (до 1000) будем использовать:

- Виртуализацию списков
- Оптимизированную отрисовку через React.memo
- Эффективные алгоритмы расположения карточек через Dagre

## 7. Заключение

Данная архитектура предоставляет модульную, расширяемую и поддерживаемую основу для разработки приложения Dialog Craft. Четкое разделение обязанностей между компонентами и использование современных паттернов проектирования обеспечивает гибкость для будущих изменений и добавления новых функций.
