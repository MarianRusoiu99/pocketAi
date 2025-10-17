# Tasks: Clean and Refactor Architecture

**Input**: Design documents from `/specs/001-clean-refactor-architecture/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the feature specification, so implementation-focused tasks are prioritized.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `client/src/`, `pocketbase/src/`, based on plan.md structure
- Maintaining existing folder structure: client/, pocketbase/, rivet/, scripts/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create modular Go structure directories in pocketbase/src/{handlers,services,repositories,models,interfaces,middleware}
- [ ] T002 [P] Create Go test directories in pocketbase/tests/{integration,handlers,services}
- [ ] T003 [P] Create feature-based frontend directories in client/src/features/{auth,workflows,stories,notifications}
- [ ] T004 [P] Create shared frontend directories in client/src/shared/{api,components,services,types}
- [ ] T005 [P] Create organized scripts directories in scripts/{dev,build,utils,docs}

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Copy contract interfaces from specs/001-clean-refactor-architecture/contracts/ to pocketbase/src/interfaces/
- [ ] T007 [P] Update Go module in pocketbase/go.mod to support new module structure
- [ ] T008 [P] Create base dependency injection setup in pocketbase/src/di/container.go
- [ ] T009 [P] Implement configuration service in pocketbase/src/services/config_service.go
- [ ] T010 [P] Create error handling framework in pocketbase/src/models/errors.go
- [ ] T011 [P] Setup shared HTTP client in pocketbase/src/services/http_client.go
- [ ] T012 [P] Create shared repository base in pocketbase/src/repositories/base.go
- [ ] T013 [P] Setup environment validation in pocketbase/src/config/env.go

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Remove Unused Code and Dependencies (Priority: P1) 🎯 MVP

**Goal**: Clean codebase with all unused code, dependencies, and files removed while maintaining existing functionality

**Independent Test**: Build the project, run all existing functionality, verify no broken imports or missing dependencies

### Implementation for User Story 1

- [ ] T014 [P] [US1] Remove migration artifacts: client/src/api/MigrationDemoComponent.tsx
- [ ] T015 [P] [US1] Remove migration documentation: client/src/api/MIGRATION.md  
- [ ] T016 [P] [US1] Remove deprecated service file: client/src/services/pocketbase.ts
- [ ] T017 [P] [US1] Fix TypeScript ignore in client/src/router.tsx (replace @ts-ignore with proper typing)
- [ ] T018 [P] [US1] Run dependency audit in client/ directory and remove unused npm packages
- [ ] T019 [P] [US1] Run go mod tidy in pocketbase/ directory to clean Go dependencies  
- [ ] T020 [US1] Search and remove unused imports across client/src/ using ESLint
- [ ] T021 [US1] Validate i18n setup complexity vs usage in client/src/i18n/ and simplify if over-engineered
- [ ] T022 [US1] Run full build and test suite to verify no regressions after cleanup
- [ ] T023 [US1] Update documentation to reflect removed files and simplified dependencies

**Checkpoint**: At this point, User Story 1 should be fully functional - clean codebase with no unused artifacts

---

## Phase 4: User Story 2 - Refactor Code to Follow SOLID Principles (Priority: P2)

**Goal**: Codebase strictly follows SOLID principles with clear separation of concerns and dependency inversion

**Independent Test**: Each component has single responsibility and follows dependency inversion patterns

### Implementation for User Story 2

- [ ] T024 [P] [US2] Extract story generation service interface in pocketbase/src/services/story_generation_service.go
- [ ] T025 [P] [US2] Extract Rivet client service interface in pocketbase/src/services/rivet_client.go
- [ ] T026 [P] [US2] Create story repository implementation in pocketbase/src/repositories/story_repository.go
- [ ] T027 [P] [US2] Create user repository implementation in pocketbase/src/repositories/user_repository.go
- [ ] T028 [P] [US2] Create workflow session repository in pocketbase/src/repositories/workflow_session_repository.go
- [ ] T029 [US2] Extract story generation handler to pocketbase/src/handlers/story_handler.go
- [ ] T030 [US2] Extract authentication handlers to pocketbase/src/handlers/auth_handler.go
- [ ] T031 [US2] Create workflow factory implementation in pocketbase/src/services/workflow_factory.go
- [ ] T032 [US2] Implement dependency injection in pocketbase/main.go using extracted services
- [ ] T033 [US2] Create domain models in pocketbase/src/models/{story,user,workflow}.go
- [ ] T034 [P] [US2] Create custom React hooks in client/src/features/stories/hooks/useStoryGeneration.ts
- [ ] T035 [P] [US2] Organize authentication components in client/src/features/auth/
- [ ] T036 [P] [US2] Organize workflow components in client/src/features/workflows/
- [ ] T037 [US2] Refactor story generation page to use feature-based structure in client/src/features/stories/
- [ ] T038 [US2] Update import statements throughout client/src/ to use new shared/ structure
- [ ] T039 [US2] Validate SOLID compliance across all refactored components
- [ ] T040 [US2] Run integration tests to ensure refactored architecture works end-to-end

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - clean SOLID architecture

---

## Phase 5: User Story 3 - Organize Scripts Folder and Improve Developer Experience (Priority: P3)

**Goal**: Clean and well-organized scripts folder with clear documentation for predictable development workflows

**Independent Test**: Follow script documentation to set up project from scratch and verify all workflows work

### Implementation for User Story 3

- [ ] T041 [P] [US3] Reorganize development scripts into scripts/dev/{setup.sh,start.sh,test.sh}
- [ ] T042 [P] [US3] Reorganize build scripts into scripts/build/{frontend.sh,backend.sh,release.sh}
- [ ] T043 [P] [US3] Create utility scripts in scripts/utils/{env-setup.sh,deps-check.sh,cleanup.sh}
- [ ] T044 [P] [US3] Create comprehensive script documentation in scripts/docs/README.md
- [ ] T045 [US3] Standardize script naming conventions and parameter handling across all scripts
- [ ] T046 [US3] Add error handling and logging to all scripts using scripts/utils/common.sh
- [ ] T047 [US3] Create environment setup validation in scripts/utils/env-setup.sh
- [ ] T048 [US3] Update main project documentation to reference new script organization
- [ ] T049 [US3] Test complete developer onboarding flow using reorganized scripts
- [ ] T050 [US3] Verify symlink pattern for .env.local remains functional after script changes

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - clean scripts organization

---

## Phase 6: User Story 4 - Modularize Component Architecture (Priority: P4)

**Goal**: Properly modularized components with clear interfaces for independent development and testing

**Independent Test**: Develop or modify one component without requiring changes to other components

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create authentication middleware in pocketbase/src/middleware/auth_middleware.go
- [ ] T052 [P] [US4] Create request validation middleware in pocketbase/src/middleware/validation_middleware.go
- [ ] T053 [P] [US4] Create logging middleware in pocketbase/src/middleware/logging_middleware.go
- [ ] T054 [P] [US4] Implement circuit breaker for external services in pocketbase/src/services/circuit_breaker.go
- [ ] T055 [P] [US4] Create retry policy for Rivet integration in pocketbase/src/services/retry_policy.go
- [ ] T056 [US4] Implement notification service interface in pocketbase/src/services/notification_service.go
- [ ] T057 [US4] Create email service abstraction in pocketbase/src/services/email_service.go
- [ ] T058 [P] [US4] Implement shared UI components in client/src/shared/components/
- [ ] T059 [P] [US4] Create workflow-specific UI components in client/src/components/workflows/
- [ ] T060 [P] [US4] Implement shared API client in client/src/shared/api/client.ts
- [ ] T061 [US4] Create feature-specific API slices in client/src/features/{auth,stories,workflows}/api/
- [ ] T062 [US4] Implement error boundaries for each feature in client/src/features/*/ErrorBoundary.tsx
- [ ] T063 [US4] Create shared type definitions in client/src/shared/types/
- [ ] T064 [US4] Test component isolation by modifying story generation without affecting auth
- [ ] T065 [US4] Test component isolation by adding new workflow type without affecting existing endpoints
- [ ] T066 [US4] Run comprehensive integration tests across all modular components

**Checkpoint**: All user stories should now be independently functional - fully modular architecture

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Update main project documentation in README.md to reflect new architecture
- [ ] T068 [P] Create architecture documentation in docs/CLEAN_ARCHITECTURE.md
- [ ] T069 [P] Update Copilot instructions in .github/copilot-instructions.md with new patterns
- [ ] T070 Code cleanup and dead code elimination across all components
- [ ] T071 Performance optimization: measure and improve build times and response times
- [ ] T072 [P] Security hardening: review all authentication and authorization flows
- [ ] T073 [P] Add comprehensive error handling examples in docs/ERROR_HANDLING.md
- [ ] T074 Run quickstart.md validation to ensure all instructions work
- [ ] T075 Final SOLID principle compliance audit across entire codebase
- [ ] T076 Measure and document success criteria: build time improvement, code reduction, setup time

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on clean codebase from US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - May integrate with US2 but independently testable

### Within Each User Story

- All tasks marked [P] within a story can run in parallel
- Tasks without [P] have dependencies on completion of previous tasks in the same story
- Each story checkpoint validates independent functionality

### Parallel Opportunities

- **Setup Phase**: T002, T003, T004, T005 can run in parallel
- **Foundational Phase**: T007-T013 can run in parallel after T006 completes
- **User Story 1**: T014-T019, T021 can run in parallel; T020, T022, T023 are sequential
- **User Story 2**: T024-T028, T034-T036 can run in parallel; T029-T033, T037-T040 are sequential
- **User Story 3**: T041-T044 can run in parallel; T045-T050 are sequential  
- **User Story 4**: T051-T055, T058-T060 can run in parallel; T056-T057, T061-T066 are sequential
- **Polish Phase**: T067-T069, T072-T073 can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all service interfaces together:
Task: "Extract story generation service interface in pocketbase/src/services/story_generation_service.go"
Task: "Extract Rivet client service interface in pocketbase/src/services/rivet_client.go"

# Launch all repository implementations together:
Task: "Create story repository implementation in pocketbase/src/repositories/story_repository.go" 
Task: "Create user repository implementation in pocketbase/src/repositories/user_repository.go"

# Launch all frontend feature organization together:
Task: "Create custom React hooks in client/src/features/stories/hooks/useStoryGeneration.ts"
Task: "Organize authentication components in client/src/features/auth/"
Task: "Organize workflow components in client/src/features/workflows/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) 
3. Complete Phase 3: User Story 1 (Clean codebase)
4. **STOP and VALIDATE**: Test that all existing functionality works without unused code
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Clean MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (SOLID Architecture)
4. Add User Story 3 → Test independently → Deploy/Demo (Clean Scripts)
5. Add User Story 4 → Test independently → Deploy/Demo (Modular Architecture)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Cleanup)
   - Developer B: User Story 2 (SOLID Principles) 
   - Developer C: User Story 3 (Scripts Organization)
   - Developer D: User Story 4 (Modularization)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability  
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Success criteria: 20% build time improvement, 15% code reduction, <10min setup time, zero linting violations
- Maintain existing folder structure: client/, pocketbase/, rivet/, scripts/
- All existing functionality must continue working: authentication, notifications, email, story generation