# WITH_Server
Server 개고수들의 개발저장📗📘

## REST API WIKI
[REST API 문서](https://github.com/TEAM-WITH/WITH_Server/wiki)

## 팀원 역할

### 박형모
 - 채팅 기능 구현
 - 홈 기능 구현
 - Chat table 설계 및 구축
 - 소스 코드 수정 및 최적화
 - EC2 배포 관리
### 김민준
 - 게시글 기능 구현
 - Board table 설계 및 구축
 - 소스 코드 수정 및 최적화
 - git branch 관리
 - 이미지 업로드 기능 구현
### 조하담
 - 마이페이지 기능 구현
 - 홈 기능 구현
 - 사용자 평가 기능 구현
 - 자동 test 환경 구축
 - API 문서 작성
### 조연주
 - 계정 관리 기능 구현
 - JWT 미들웨어 구현
 - Region Table 설계 및 구축
 - User table 설계 및 구축
 - git branch 관리
 - 이미지 업로드 기능 구현

## 핵심 기능
 - 최근 본 게시글(6개) 조회 기능을 통해, 현재 보고있는 게시글을 실수로 나가서 그 게시글을 다시 찾아야하는 상황일때 쉽게 찾을 수 있다.
 
 - 사용자가 현재 찾고 있는 여행지 기준으로, 그 주변의 가장 인기 많은(게시글 수 기준) 여행지를 추천한다. 

 - 게시글 작성시, 동성 필터를 적용하면 낮선 이성에게 나의 게시글과 프로필이 보이지 않아 안전하게 동행을 구할 수 있다.
 
 - 게시글 검색시, 동성 필터를 적용하면 게시글 작성자가 동성인 게시글만 조회된다.

 - 동행을 구하기 위해 1대1 채팅을 사용할 수 있고, 동행을 약속하면 채팅목록에서 우선순위가 올라 상단으로 올라간다.
 
 - 희망하는 수의 동행을 모두 구하면, 게시글의 마감기능을 통해 검색할 때 내 게시글이 더 이상 노출되지 않는다. 
 
 - 동행이 끝난 후, 상대방에 대한 평가(좋아요/싫어요)를 진행할 수 있다.
 
 - 평가(좋아요/싫어요)에 따라 사용자에게 뱃지를 부여하여 사용자간의 신뢰를 형성한다.  
 
 - ...
 
## package

 - aws-sdk : AWS 서비스를 위한 JavaScript 객체가 제공
 - crypto-promise : 패스워드 암호화 및 인증을 지원하는 모듈의 비동기 버전
 - jsonwebtoken : JWT(Json Web Token) 생성 및 인증
 - moment : 날짜(Date)형식 데이터의 파싱, 검증, 조작
 - multer-s3 : AWS S3 파일 업로드 도구
 - node-cron : Cron은 유닉스 계열 컴퓨터 운영 체제의 시간 기반 Job 스케줄러
 - promise-mysql : mysql의 비동기 버전
 
<pre><code>
  "dependencies": {
    "aws-sdk": "^2.596.0",
    "charset": "^1.0.1",
    "cookie-parser": "^1.4.4",
    "crypto": "^1.0.1",
    "crypto-promise": "^2.1.0",
    "debug": "~2.6.9",
    "express": "^4.16.4",
    "http-errors": "^1.6.3",
    "iconv": "^2.3.5",
    "iconv-lite": "^0.5.0",
    "jade": "~1.11.0",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "moment-timezone": "^0.5.27",
    "morgan": "~1.9.1",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "node-cron": "^2.0.3",
    "nodemon": "^2.0.2",
    "promise-mysql": "^4.1.1",
    "urlencode": "^1.1.0",
    "util": "^0.12.1"
  }
</code></pre>

## Architecture

<img src="https://github.com/TEAM-WITH/WITH_Server/blob/master/images/server_structure.png" width="700px" height="600px"></img><br/>

## ERD

<img src="https://github.com/TEAM-WITH/WITH_Server/blob/master/images/WITH_ERD.png" width="550px" height="700px"></img><br/>

---------------------------------------

## 팀원

### 기획

* 현환희
* 안현준

### 디자이너

* 김루희
* 김미정
* 김은별

### 서버 [Page](https://github.com/TEAM-WITH/WITH_Server)

* 김민준
* 박형모
* 조연주
* 조하담

### 안드로이드 [Page](https://github.com/TEAM-WITH/WITH_Android)

* 조현아
* 최승준
* 석영현

### iOS [Page](https://github.com/TEAM-WITH/WITH_iOS)

* 김남수
* 권준

