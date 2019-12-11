
# SWVue

소프트웨어대학@Vue.js

## 실행

Development
npm run build:dev

Production
npm run build:dist

## 주의사항
1. 웹 안에서 다른 곳으로 이동할 때는 <a> 사용하지 말고, <router-link> 사용
2. 기존 프로젝트에서 swig 파일 가져와서 Vue로 바꿀 때는 공통으로 쓰는 부분은 Component로 따로 만들고, jQuery 로 된 스크립트는 가급적이면 변환
3. public 폴더 쓰지말고 static 폴더 사용 (기존 public이랑 역할 같음)
4. 기존에는 routes/index.js에서 서버에서 렌더링 하고 보내주는 경우가 많은데 그런 api 들은 전부 분리해야함