# MPLP CLI - 완전 사용 가이드

> **🌐 언어 내비게이션**: [English](../../../en/development-tools/cli/README.md) | [中文](../../../zh-CN/development-tools/cli/README.md) | [日本語](../../../ja/development-tools/cli/README.md) | [한국어](README.md) | [Español](../../../es/development-tools/cli/README.md) | [Français](../../../fr/development-tools/cli/README.md) | [Русский](../../../ru/development-tools/cli/README.md) | [Deutsch](../../../de/development-tools/cli/README.md)


> **패키지**: @mplp/cli  
> **버전**: v1.1.0-beta  
> **최종 업데이트**: 2025-09-20  
> **상태**: ✅ 프로덕션 준비 완료  

## 📚 **개요**

MPLP CLI는 멀티 에이전트 프로토콜 라이프사이클 플랫폼을 위한 포괄적인 명령줄 인터페이스입니다. 프로젝트 생성, 개발 워크플로우 관리, 코드 생성, 테스트 및 배포를 위한 강력한 도구를 제공하며, 엔터프라이즈급 기능과 광범위한 사용자 정의 옵션을 갖추고 있습니다.

### **🎯 주요 기능**

- **🚀 프로젝트 스캐폴딩**: 여러 템플릿(기본, 고급, 엔터프라이즈)으로 새로운 MPLP 프로젝트 생성
- **📋 코드 생성**: 에이전트, 워크플로우, 구성 및 기타 컴포넌트 생성
- **🔧 개발 서버**: 핫 리로드 및 디버깅 지원이 포함된 내장 개발 서버
- **🏗️ 빌드 시스템**: 프로덕션 준비 빌드 및 최적화 도구
- **🧪 테스트 통합**: 포괄적인 테스트 유틸리티 및 커버리지 보고
- **📊 코드 품질**: 코드 품질 검사, 린팅 및 자동 포맷팅
- **📦 패키지 관리**: npm, yarn, pnpm 지원 및 자동 감지
- **🌐 Git 통합**: 자동 Git 저장소 초기화 및 워크플로우 지원
- **📚 템플릿 시스템**: 사용자 정의 프로젝트 구조를 가진 확장 가능한 템플릿 시스템
- **🔍 프로젝트 분석**: 상세한 프로젝트 정보 및 종속성 분석

### **📦 설치**

```bash
# 전역 설치 (권장)
npm install -g @mplp/cli

# yarn 사용
yarn global add @mplp/cli

# pnpm 사용
pnpm add -g @mplp/cli

# 설치 확인
mplp --version
```

## 🚀 **빠른 시작**

### **첫 번째 프로젝트 생성**

```bash
# 기본 프로젝트 생성
mplp init my-first-agent

# 프로젝트 디렉토리로 이동
cd my-first-agent

# 개발 시작
mplp dev

# 프로덕션용 빌드
mplp build
```

### **다양한 템플릿 사용**

```bash
# 기본 템플릿 (기본값)
mplp init simple-agent --template basic

# 오케스트레이션 기능이 포함된 고급 템플릿
mplp init complex-system --template advanced

# 완전한 툴체인이 포함된 엔터프라이즈 템플릿
mplp init production-system --template enterprise
```

## 📋 **명령어 참조**

### **mplp init**

사용자 정의 가능한 템플릿과 구성으로 새로운 MPLP 프로젝트를 생성합니다.

#### **구문**

```bash
mplp init <프로젝트명> [옵션]
```

#### **옵션**

- `--template, -t <템플릿>`: 프로젝트 템플릿 (basic, advanced, enterprise)
- `--description, -d <설명>`: 프로젝트 설명
- `--author, -a <작성자>`: 프로젝트 작성자
- `--license, -l <라이선스>`: 프로젝트 라이선스 (MIT, Apache-2.0 등)
- `--package-manager, -pm <매니저>`: 패키지 매니저 (npm, yarn, pnpm)
- `--git, -g`: Git 저장소 초기화 (기본값: true)
- `--install, -i`: 생성 후 종속성 설치 (기본값: true)
- `--typescript, -ts`: TypeScript 사용 (기본값: true)
- `--eslint`: ESLint 구성 추가 (기본값: true)
- `--prettier`: Prettier 구성 추가 (기본값: true)
- `--jest`: Jest 테스트 프레임워크 추가 (기본값: true)
- `--force, -f`: 기존 디렉토리 덮어쓰기
- `--dry-run`: 실제로 생성하지 않고 생성될 내용 표시

#### **예제**

```bash
# 기본 프로젝트 생성
mplp init my-agent

# 사용자 정의 설정으로 고급 프로젝트 생성
mplp init enterprise-bot \
  --template enterprise \
  --description "엔터프라이즈 챗봇 시스템" \
  --author "당신의 이름" \
  --license MIT \
  --package-manager yarn

# 프롬프트 없이 빠른 설정
mplp init quick-agent --template basic --force --no-git

# 구조를 미리 보기 위한 드라이 런
mplp init test-project --template advanced --dry-run
```

### **mplp generate**

코드 컴포넌트, 구성 및 보일러플레이트 코드를 생성합니다.

#### **구문**

```bash
mplp generate <타입> <이름> [옵션]
```

#### **타입**

- `agent`: 새로운 에이전트 클래스 생성
- `workflow`: 워크플로우 구성 생성
- `adapter`: 플랫폼 어댑터 생성
- `config`: 구성 파일 생성
- `test`: 테스트 파일 생성
- `component`: 사용자 정의 컴포넌트 생성

#### **옵션**

- `--output, -o <경로>`: 출력 디렉토리
- `--template, -t <템플릿>`: 생성 템플릿
- `--overwrite, -w`: 기존 파일 덮어쓰기
- `--dry-run`: 생성될 코드 미리보기

#### **예제**

```bash
# 새로운 에이전트 생성
mplp generate agent ChatBot --output src/agents

# 워크플로우 생성
mplp generate workflow DataProcessing --template advanced

# 플랫폼 어댑터 생성
mplp generate adapter CustomPlatform --output src/adapters

# 테스트 파일 생성
mplp generate test ChatBot --output tests/agents
```

### **mplp dev**

핫 리로드 및 디버깅 지원이 포함된 개발 서버를 시작합니다.

#### **구문**

```bash
mplp dev [옵션]
```

#### **옵션**

- `--port, -p <포트>`: 개발 서버 포트 (기본값: 3000)
- `--host, -h <호스트>`: 개발 서버 호스트 (기본값: localhost)
- `--open, -o`: 브라우저 자동 열기
- `--watch, -w <경로>`: 감시할 추가 경로
- `--ignore, -i <패턴>`: 무시할 패턴
- `--debug, -d`: 디버그 모드 활성화
- `--verbose, -v`: 상세 로깅
- `--no-reload`: 핫 리로드 비활성화
- `--inspect`: Node.js 인스펙터 활성화

#### **예제**

```bash
# 개발 서버 시작
mplp dev

# 사용자 정의 포트 및 호스트
mplp dev --port 8080 --host 0.0.0.0

# 인스펙터가 포함된 디버그 모드
mplp dev --debug --inspect

# 추가 디렉토리 감시
mplp dev --watch "config/**" --watch "templates/**"
```

### **mplp build**

최적화 및 번들링을 통해 프로덕션용으로 프로젝트를 빌드합니다.

#### **구문**

```bash
mplp build [옵션]
```

#### **옵션**

- `--output, -o <디렉토리>`: 출력 디렉토리 (기본값: dist)
- `--mode, -m <모드>`: 빌드 모드 (production, development)
- `--target, -t <타겟>`: 빌드 타겟 (node, browser, both)
- `--minify`: 출력 최소화 (프로덕션에서 기본값: true)
- `--sourcemap`: 소스맵 생성
- `--analyze`: 번들 크기 분석
- `--clean`: 빌드 전 출력 디렉토리 정리
- `--watch, -w`: 개발용 감시 모드

#### **예제**

```bash
# 프로덕션 빌드
mplp build

# 소스맵이 포함된 개발 빌드
mplp build --mode development --sourcemap

# Node.js와 브라우저 모두를 위한 빌드
mplp build --target both --analyze

# 감시 모드 빌드
mplp build --watch --mode development
```

### **mplp test**

포괄적인 테스트 유틸리티와 커버리지 보고로 테스트를 실행합니다.

#### **구문**

```bash
mplp test [옵션] [패턴]
```

#### **옵션**

- `--watch, -w`: 감시 모드
- `--coverage, -c`: 커버리지 보고서 생성
- `--verbose, -v`: 상세 출력
- `--silent, -s`: 무음 모드
- `--bail, -b`: 첫 번째 실패 시 중지
- `--parallel, -p`: 테스트 병렬 실행
- `--max-workers <수>`: 최대 워커 프로세스 수
- `--timeout <ms>`: 테스트 타임아웃
- `--setup <파일>`: 설정 파일
- `--config <파일>`: 사용자 정의 Jest 구성

#### **예제**

```bash
# 모든 테스트 실행
mplp test

# 커버리지와 함께 테스트 실행
mplp test --coverage

# 감시 모드
mplp test --watch

# 특정 테스트 파일 실행
mplp test src/agents --verbose

# 병렬 실행
mplp test --parallel --max-workers 4
```

### **mplp lint**

코드 품질 검사 및 자동 포맷팅을 실행합니다.

#### **구문**

```bash
mplp lint [옵션] [파일]
```

#### **옵션**

- `--fix, -f`: 문제 자동 수정
- `--format <포맷터>`: 출력 형식 (stylish, json, table)
- `--quiet, -q`: 오류만 보고
- `--max-warnings <수>`: 허용되는 최대 경고 수
- `--cache`: 빠른 린팅을 위한 캐시 사용
- `--no-eslintrc`: ESLint 구성 파일 비활성화

#### **예제**

```bash
# 모든 파일 린트
mplp lint

# 린트 및 문제 수정
mplp lint --fix

# 특정 파일 린트
mplp lint src/agents/*.ts --format table

# 조용한 모드 (오류만)
mplp lint --quiet --max-warnings 0
```

### **mplp clean**

빌드 아티팩트 및 임시 파일을 정리합니다.

#### **구문**

```bash
mplp clean [옵션]
```

#### **옵션**

- `--all, -a`: node_modules를 포함한 모든 아티팩트 정리
- `--cache, -c`: 캐시 파일 정리
- `--logs, -l`: 로그 파일 정리
- `--force, -f`: 확인 없이 강제 정리

#### **예제**

```bash
# 빌드 디렉토리 정리
mplp clean

# 모든 것 정리
mplp clean --all

# 캐시 및 로그 정리
mplp clean --cache --logs
```

### **mplp info**

프로젝트 및 환경 정보를 표시합니다.

#### **구문**

```bash
mplp info [옵션]
```

#### **옵션**

- `--project, -p`: 프로젝트별 정보 표시
- `--env, -e`: 환경 정보 표시
- `--json, -j`: JSON 형식으로 출력
- `--verbose, -v`: 상세 정보 표시

#### **예제**

```bash
# 일반 정보
mplp info

# 프로젝트 세부사항
mplp info --project --verbose

# JSON 형식의 환경 정보
mplp info --env --json
```

## 🔧 **구성**

### **프로젝트 구성**

프로젝트 루트에 `mplp.config.js` 파일을 생성하세요:

```javascript
module.exports = {
  // 빌드 구성
  build: {
    target: 'node',
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },

  // 개발 서버 구성
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    watch: ['src/**/*', 'config/**/*']
  },

  // 테스트 구성
  test: {
    coverage: true,
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },

  // 린팅 구성
  lint: {
    fix: true,
    cache: true,
    maxWarnings: 0
  },

  // 템플릿 구성
  templates: {
    customTemplatesDir: './templates',
    defaultTemplate: 'basic'
  }
};
```
