deploy: deploy-github deploy-s3

deploy-github:
	ng build --prod --base-href=https://mgritter.github.io/soffit-web/ --output=path=dist/github
	rm -r docs/*
	cp -r dist/github/* docs/
	echo -e "---\npermalink: /404.html\n---" > docs/404.html
	cat docs/index.html >> docs/404.html


deploy-s3
	ng build --prod
	aws --profile soffit s3 cp dist/soffit-web s3://soffit.combinatorium.com --recursive

