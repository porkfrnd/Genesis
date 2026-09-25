from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:4173'


def check(condition, message):
    if not condition:
        raise AssertionError(message)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(BASE, wait_until='networkidle')
    page.get_by_role('button', name='Open the genome editor').first.click()
    speed = page.get_by_label('Movement speed allele 2')
    choice = 's' if speed.input_value() == 'S' else 'S'
    speed.select_option(choice)
    page.get_by_role('button', name='Apply this change').click()
    page.locator('button.nav-item', has_text='Lab').click()
    page.get_by_role('button', name='Run 10 generations').first.click()
    page.locator('button.nav-item', has_text='Evolution').click()
    page.get_by_label('Name this run').fill('Cold archive')
    page.get_by_role('button', name='Save current state').click()
    page.get_by_text('Saved Cold archive.', exact=True).first.wait_for()
    check(page.get_by_text('Cold archive', exact=False).count() >= 1, 'saved row missing')
    page.get_by_role('button', name='Restore').click()
    check(page.locator('button.nav-item', has_text='Lab').get_attribute('aria-current') == 'page', 'restore failed')
    check(not errors, str(errors))
    print('Save smoke passed')
    browser.close()
