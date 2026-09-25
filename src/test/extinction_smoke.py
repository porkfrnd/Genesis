from playwright.sync_api import sync_playwright


def check(condition, message):
    if not condition:
        raise AssertionError(message)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:4173', wait_until='networkidle')
    page.get_by_label('Temperature').fill('-20')
    page.get_by_label('Food availability').fill('0')
    page.get_by_label('Predation pressure').fill('1')
    page.get_by_text('Advanced: mutation rate', exact=True).click()
    page.get_by_label('Mutation rate').fill('0')
    page.get_by_text('More run controls', exact=True).click()
    page.get_by_role('button', name='+1000 generations').click()
    page.wait_for_timeout(500)
    check(page.get_by_text('Population extinct', exact=True).is_visible(), 'extinction state missing')
    check(page.get_by_role('button', name='Restart dish').is_visible(), 'restart action missing')
    check(not errors, str(errors))
    page.screenshot(path='browser-extinction.png', full_page=True)
    print('Extinction smoke passed')
    browser.close()
